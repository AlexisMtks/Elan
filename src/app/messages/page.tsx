"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";
import Link from "next/link";

type ConversationId = number;

interface Conversation {
  id: ConversationId;
  contactName: string;
  contactProfileId: string | null;
  productTitle: string;
  listingId: string | null;
  lastMessagePreview: string | null;
  updatedAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  fromMe: boolean;
  content: string;
  time: string;
}

export default function MessagesPage() {
  const { user, checking } = useRequireAuth();

  const searchParams = useSearchParams();
  const sellerIdFromQuery = searchParams.get("seller");
  const listingIdFromQuery = searchParams.get("listing");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<ConversationId | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 🔹 Charger les conversations pour l’utilisateur connecté
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);

      const { data, error } = await supabase
          .from("conversations")
          .select(
              `
          id,
          buyer_id,
          seller_id,
          listing_id,
          last_message_at,
          last_message_preview,
          listing:listings ( id, title ),
          buyer:profiles!conversations_buyer_id_fkey ( id, display_name ),
          seller:profiles!conversations_seller_id_fkey ( id, display_name ),
          messages:messages(count)
        `
          )
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order("last_message_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement conversations :", error);
        setLoadingConversations(false);
        return;
      }

      const formatted: Conversation[] = (data ?? []).map((conv: any) => {
        const sellerRow = conv.seller?.[0];
        const buyerRow = conv.buyer?.[0];
        const listingRow = conv.listing?.[0];

        const isSeller = conv.seller_id === user.id;
        const contactProfile = isSeller ? buyerRow : sellerRow;

        const contactName =
            contactProfile?.display_name ??
            (isSeller ? "Acheteur inconnu" : "Vendeur inconnu");

        return {
          id: conv.id as number,
          contactName,
          contactProfileId: contactProfile?.id ?? null,      // ✅
          productTitle: listingRow?.title ?? "Annonce supprimée",
          listingId: conv.listing_id ?? listingRow?.id ?? null, // ✅
          lastMessagePreview: conv.last_message_preview as string | null,
          updatedAt: conv.last_message_at
              ? new Date(conv.last_message_at).toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              })
              : "Date inconnue",
          unreadCount: conv.messages?.[0]?.count ?? 0,
        };
      });

      setConversations(formatted);

      // ✅ Si on vient d'une annonce, essayer de trouver la bonne conversation
      let initialConversationId: ConversationId | null = null;

      if (sellerIdFromQuery && listingIdFromQuery) {
        const matched = formatted.find(
            (conv) =>
                conv.listingId === listingIdFromQuery &&
                conv.contactProfileId === sellerIdFromQuery
        );
        if (matched) {
          initialConversationId = matched.id;
        }
      }

      // Sinon, fallback sur la première conversation
      if (!initialConversationId && formatted.length > 0) {
        initialConversationId = formatted[0].id;
      }

      if (initialConversationId) {
        setSelectedConversationId(initialConversationId);
      }

      setLoadingConversations(false);
    };

    fetchConversations();
  }, [user, sellerIdFromQuery, listingIdFromQuery]);

  // 🔹 Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (!user || !selectedConversationId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);

      const { data, error } = await supabase
          .from("messages")
          .select("id, sender_id, content, created_at")
          .eq("conversation_id", selectedConversationId)
          .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur chargement messages :", error);
        setLoadingMessages(false);
        return;
      }

      const formatted: Message[] = (data ?? []).map((m: any) => ({
        id: m.id.toString(),
        fromMe: m.sender_id === user.id,
        content: m.content ?? "",
        time: new Date(m.created_at).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formatted);
      setLoadingMessages(false);
    };

    fetchMessages();
  }, [user, selectedConversationId]);

  // 🔹 Envoi (simulation)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    alert(`Simulation : envoi du message : "${messageInput}"`);
    setMessageInput("");
  };

  const selectedConversation = conversations.find(
      (c) => c.id === selectedConversationId
  );

  // ÉTATS D’AUTH
  if (checking) {
    return (
        <p className="text-sm text-muted-foreground">
          Vérification de votre session…
        </p>
    );
  }

  if (!user) {
    return (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Vous devez être connecté pour accéder à vos messages.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Aller à la page de connexion</Link>
          </Button>
        </div>
    );
  }

  // Ici, on est sûr d’avoir un user authentifié
  return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
        {/* Liste des conversations */}
        <Card className="flex flex-col rounded-2xl border p-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold">Conversations</p>
            <Input
                placeholder="Rechercher une conversation"
                className="h-9 text-sm"
            />
          </div>

          <div className="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto">
            {loadingConversations && (
                <p className="text-xs text-muted-foreground text-center mt-6">
                  Chargement de vos conversations…
                </p>
            )}

            {!loadingConversations && conversations.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-6">
                  Aucune conversation pour le moment.
                </p>
            )}

            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === selectedConversationId}
                    onSelect={() => setSelectedConversationId(conversation.id)}
                />
            ))}
          </div>
        </Card>

        {/* Fil de messages */}
        <Card className="flex flex-col rounded-2xl border p-4">
          {selectedConversation ? (
              <>
                <ThreadHeader conversation={selectedConversation} />

                <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-muted/40 p-3 text-sm">
                  {loadingMessages && (
                      <p className="text-center text-xs text-muted-foreground">
                        Chargement des messages…
                      </p>
                  )}

                  {!loadingMessages &&
                      messages.map((message) => (
                          <MessageBubble key={message.id} message={message} />
                      ))}

                  {!loadingMessages && messages.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground">
                        Aucun message pour le moment.
                      </p>
                  )}
                </div>

                <form
                    onSubmit={handleSendMessage}
                    className="mt-4 flex items-end gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <label
                        htmlFor="message"
                        className="text-xs text-muted-foreground"
                    >
                      Votre message
                    </label>
                    <textarea
                        id="message"
                        rows={3}
                        className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Écrivez votre message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="self-stretch">
                    Envoyer
                  </Button>
                </form>
              </>
          ) : (
              <div className="flex h-full flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <p>Sélectionnez une conversation dans la colonne de gauche.</p>
              </div>
          )}
        </Card>
      </div>
  );
}

/* --- Sous-composants inchangés --- */

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}

function ConversationItem({
                            conversation,
                            isActive,
                            onSelect,
                          }: ConversationItemProps) {
  const initials =
      conversation.contactName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "EL";

  return (
      <button
          type="button"
          onClick={onSelect}
          className={[
            "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs transition",
            isActive
                ? "border-foreground bg-foreground/5"
                : "border-transparent hover:bg-muted/60",
          ].join(" ")}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-0.5">
          <p className="text-xs font-medium">{conversation.contactName}</p>
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {conversation.productTitle}
          </p>
          {conversation.lastMessagePreview && (
              <p className="line-clamp-1 text-[11px] text-muted-foreground">
                {conversation.lastMessagePreview}
              </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-muted-foreground">
          {conversation.updatedAt}
        </span>
          {conversation.unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-foreground-foreground">
            {conversation.unreadCount}
          </span>
          )}
        </div>
      </button>
  );
}

interface ThreadHeaderProps {
  conversation: Conversation;
}

function ThreadHeader({ conversation }: ThreadHeaderProps) {
  const router = useRouter();

  const initials =
      conversation.contactName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "EL";

  const handleViewListing = () => {
    if (conversation.listingId) {
      router.push(`/listings/${conversation.listingId}`);
    }
  };

  return (
      <div className="flex items-center justify-between gap-4 border-b pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 text-sm">
            <p className="font-medium">{conversation.contactName}</p>
            <p className="text-xs text-muted-foreground">
              À propos de : {conversation.productTitle}
            </p>
          </div>
        </div>

        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewListing}
        >
          Voir l’annonce
        </Button>
      </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const bubbleClasses = message.fromMe
      ? "ml-auto rounded-2xl rounded-br-sm bg-foreground text-foreground-foreground"
      : "mr-auto rounded-2xl rounded-bl-sm bg-muted text-foreground";

  const timeClasses = message.fromMe
      ? "text-[10px] text-muted-foreground/80 text-right"
      : "text-[10px] text-muted-foreground/80";

  return (
      <div className="max-w-[80%] space-y-1">
        <div className={`px-3 py-2 text-xs ${bubbleClasses}`}>
          {message.content}
        </div>
        <p className={timeClasses}>{message.time}</p>
      </div>
  );
}
