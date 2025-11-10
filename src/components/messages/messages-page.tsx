"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";

type ConversationId = number;

interface Conversation {
    id: ConversationId;
    contactName: string;
    productTitle: string;
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

/**
 * Page principale de messagerie : liste de conversations + fil de messages
 */
export function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] =
        useState<ConversationId | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // 🔹 Récupérer l’utilisateur connecté
    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        }
        fetchUser();
    }, []);

    // 🔹 Charger les conversations
    useEffect(() => {
        if (!currentUserId) return;

        async function fetchConversations() {
            const { data, error } = await supabase
                .from("conversations")
                .select(
                    `
          id,
          last_message_at,
          last_message_preview,
          listing:listings ( title ),
          buyer:profiles!conversations_buyer_id_fkey ( id, display_name ),
          seller:profiles!conversations_seller_id_fkey ( id, display_name ),
          messages:messages(count)
        `
                )
                .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
                .order("last_message_at", { ascending: false });

            if (error) {
                console.error("Erreur chargement conversations :", error);
                return;
            }

            const formatted = data.map((conv) => {
                const sellerRow = conv.seller?.[0];
                const buyerRow = conv.buyer?.[0];

                const isSeller = sellerRow?.id === currentUserId;

                const contactName = isSeller
                    ? buyerRow?.display_name ?? "Acheteur inconnu"
                    : sellerRow?.display_name ?? "Vendeur inconnu";

                return {
                    id: conv.id,
                    contactName,
                    productTitle: conv.listing?.title ?? "Annonce supprimée",
                    lastMessagePreview: conv.last_message_preview,
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
            if (formatted.length > 0 && !selectedConversationId) {
                setSelectedConversationId(formatted[0].id);
            }
        }

        fetchConversations();
    }, [currentUserId]);

    // 🔹 Charger les messages de la conversation sélectionnée
    useEffect(() => {
        if (!selectedConversationId || !currentUserId) return;

        async function fetchMessages() {
            const { data, error } = await supabase
                .from("messages")
                .select("id, sender_id, content, created_at")
                .eq("conversation_id", selectedConversationId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Erreur chargement messages :", error);
                return;
            }

            const formatted = data.map((m) => ({
                id: m.id.toString(),
                fromMe: m.sender_id === currentUserId,
                content: m.content ?? "",
                time: new Date(m.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            }));

            setMessages(formatted);
        }

        fetchMessages();
    }, [selectedConversationId, currentUserId]);

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
                    {conversations.length === 0 && (
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
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            {messages.length === 0 && (
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
    const initials =
        conversation.contactName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "EL";

    const handleViewListing = () => {
        alert("Simulation : redirection vers la page de l’annonce liée.");
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