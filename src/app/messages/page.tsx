"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    buyerId: string;
    sellerId: string;
}

interface Message {
    id: string;
    fromMe: boolean;
    content: string;
    time: string;
}

// Normalise une relation Supabase (objet ou tableau) en un seul objet
function normalizeRelation<T = any>(rel: any): T | null {
    if (!rel) return null;
    if (Array.isArray(rel)) return rel[0] ?? null;
    return rel;
}

export default function MessagesPage() {
    const [conversationCreated, setConversationCreated] = useState(false);
    const { user, checking } = useRequireAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] =
        useState<ConversationId | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [querySellerId, setQuerySellerId] = useState<string | null>(null);
    const [queryListingId, setQueryListingId] = useState<string | null>(null);

    // Lecture des query params côté client
    useEffect(() => {
        if (typeof window === "undefined") return;

        const url = new URL(window.location.href);
        const seller = url.searchParams.get("seller");
        const listing = url.searchParams.get("listing");

        setQuerySellerId(seller);
        setQueryListingId(listing);
    }, []);

    useEffect(() => {
        if (!user) return;

        const syncConversations = async () => {
            setLoadingConversations(true);

            // 1) Si on vient d'une annonce (seller + listing dans l'URL), on s'assure
            //    qu'une conversation existe pour (buyer = user.id, seller = querySellerId, listing = queryListingId)
            if (
                querySellerId &&
                queryListingId &&
                !conversationCreated &&
                querySellerId !== user.id // on ne crée pas de conversation avec soi-même
            ) {
                try {
                    const { data: existing, error: existingError } = await supabase
                        .from("conversations")
                        .select("id")
                        .eq("buyer_id", user.id)
                        .eq("seller_id", querySellerId)
                        .eq("listing_id", queryListingId)
                        .maybeSingle();

                    if (existingError) {
                        console.error(
                            "Erreur recherche conversation existante :",
                            existingError,
                        );
                    }

                    if (!existing) {
                        const { error: insertError } = await supabase
                            .from("conversations")
                            .insert({
                                buyer_id: user.id,
                                seller_id: querySellerId,
                                listing_id: queryListingId,
                            });

                        if (insertError) {
                            console.error("Erreur création conversation :", insertError);
                        }
                    }

                    setConversationCreated(true);
                } catch (e) {
                    console.error(
                        "Erreur inattendue lors de la création de conversation :",
                        e,
                    );
                }
            }

            // 2) On (re)charge toutes les conversations de l'utilisateur avec les jointures complètes
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
      `,
                )
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .order("last_message_at", { ascending: false });

            if (error) {
                console.error("Erreur chargement conversations :", error);
                setLoadingConversations(false);
                return;
            }

            const formatted: Conversation[] = (data ?? []).map((conv: any) => {
                const sellerRow = normalizeRelation(conv.seller);
                const buyerRow = normalizeRelation(conv.buyer);
                const listingRow = normalizeRelation(conv.listing);

                const isCurrentUserSeller = conv.seller_id === user.id;
                const contactProfile = isCurrentUserSeller ? buyerRow : sellerRow;

                const contactName =
                    contactProfile?.display_name ??
                    (isCurrentUserSeller ? "Acheteur inconnu" : "Vendeur inconnu");

                const unreadCount = Array.isArray(conv.messages)
                    ? conv.messages[0]?.count ?? 0
                    : (conv.messages as any)?.count ?? 0;

                return {
                    id: conv.id as number,
                    contactName,
                    contactProfileId: contactProfile?.id ?? null,
                    productTitle: listingRow?.title ?? "Annonce supprimée",
                    listingId: conv.listing_id ?? listingRow?.id ?? null,
                    lastMessagePreview: conv.last_message_preview as string | null,
                    updatedAt: conv.last_message_at
                        ? new Date(conv.last_message_at).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                        })
                        : "Date inconnue",
                    unreadCount,
                    buyerId: conv.buyer_id,
                    sellerId: conv.seller_id,
                };
            });

            setConversations(formatted);

            // 3) Choix de la conversation à sélectionner
            let initialConversationId: ConversationId | null =
                formatted.length > 0 ? formatted[0].id : null;

            // Si on a des query params, on essaye de matcher LA conversation correspondante à l'annonce
            if (querySellerId && queryListingId) {
                const matched = formatted.find(
                    (conv) =>
                        conv.listingId === queryListingId &&
                        ((conv.buyerId === user.id && conv.sellerId === querySellerId) ||
                            (conv.sellerId === user.id && conv.buyerId === querySellerId)),
                );

                if (matched) {
                    initialConversationId = matched.id;
                }
            }

            if (initialConversationId) {
                setSelectedConversationId(initialConversationId);
            }

            setLoadingConversations(false);
        };

        syncConversations();
    }, [user, querySellerId, queryListingId, conversationCreated]);

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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        if (!user || !selectedConversationId) return;

        const content = messageInput.trim();

        const { data, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: selectedConversationId,
                sender_id: user.id,
                content,
            })
            .select("id, sender_id, content, created_at")
            .single();

        if (error) {
            console.error("Erreur envoi message :", error);
            return;
        }

        const newMessage: Message = {
            id: data.id.toString(),
            fromMe: true,
            content: data.content ?? content,
            time: new Date(data.created_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        // Ajout dans le fil local
        setMessages((prev) => [...prev, newMessage]);
        setMessageInput("");

        // MAJ rapide des métadonnées de la conversation (pour l’UI)
        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedConversationId
                    ? {
                        ...c,
                        lastMessagePreview: newMessage.content,
                        updatedAt: newMessage.time,
                    }
                    : c,
            ),
        );
    };

    const selectedConversation = conversations.find(
        (c) => c.id === selectedConversationId,
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
                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            Chargement de vos conversations…
                        </p>
                    )}

                    {!loadingConversations && conversations.length === 0 && (
                        <p className="mt-6 text-center text-xs text-muted-foreground">
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
