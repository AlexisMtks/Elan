"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AppModal } from "@/components/modals/app-modal";
import { supabase } from "@/lib/supabaseClient";

import type { Conversation, ConversationId, Message } from "@/types/messages";
import { ConversationItem } from "@/components/messages/conversation-item";
import { ThreadHeader } from "@/components/messages/thread-header";
import { MessageBubble } from "@/components/messages/message-bubble";

// Normalise une relation Supabase (objet ou tableau) en un seul objet
function normalizeRelation<T = any>(rel: any): T | null {
    if (!rel) return null;
    if (Array.isArray(rel)) return rel[0] ?? null;
    return rel;
}

function normalizeText(value: string): string {
    if (!value) return "";
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// extrait un montant avec symbole de monnaie, ex: "50 €", "12.5$", "12,5€"
function extractPriceRaw(query: string): string | null {
    const match = query.match(/(\d+(?:[.,]\d+)?)[\s]*([€$£])/);
    if (!match) return null;
    return match[1].replace(",", ".");
}

function formatConversationTimestamp(
    input: string | Date | null | undefined,
): string {
    if (!input) return "";

    const date = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(date.getTime())) return "";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function MessagesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Conversation[]>([]);

    const [conversationCreated, setConversationCreated] = useState(false);
    const { user, checking } = useRequireAuth();
    const router = useRouter();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] =
        useState<ConversationId | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [querySellerId, setQuerySellerId] = useState<string | null>(null);
    const [queryListingId, setQueryListingId] = useState<string | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] =
        useState<Conversation | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const markConversationAsRead = async (conversationId: ConversationId) => {
        if (!user) return;

        const { data: conv, error } = await supabase
            .from("conversations")
            .select("id, buyer_id, seller_id")
            .eq("id", conversationId)
            .maybeSingle();

        if (error || !conv) {
            console.error("Erreur récupération conversation pour read_at :", error);
            return;
        }

        const now = new Date().toISOString();
        const updates: Record<string, string> = {};

        if (conv.buyer_id === user.id) {
            updates.last_read_at_buyer = now;
        } else if (conv.seller_id === user.id) {
            updates.last_read_at_seller = now;
        } else {
            return;
        }

        const { error: updateError } = await supabase
            .from("conversations")
            .update(updates)
            .eq("id", conversationId);

        if (updateError) {
            console.error("Erreur MAJ last_read_at :", updateError);
            return;
        }

        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId
                    ? { ...c, unreadCount: 0 }
                    : c,
            ),
        );
    };

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

            if (
                querySellerId &&
                queryListingId &&
                !conversationCreated &&
                querySellerId !== user.id
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

            const { data: convData, error: convError } = await supabase
                .from("conversations")
                .select(
                    `
            id,
            buyer_id,
            seller_id,
            listing_id,
            last_message_at,
            last_message_preview,
            last_read_at_buyer,
            last_read_at_seller,
            listing:listings (
              id,
              title,
              price
            ),
            buyer:profiles!conversations_buyer_id_fkey (
              id,
              display_name,
              avatar_url
            ),
            seller:profiles!conversations_seller_id_fkey (
              id,
              display_name,
              avatar_url
            )
          `,
                )
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .order("last_message_at", { ascending: false });

            if (convError) {
                console.error("Erreur chargement conversations :", convError);
                setLoadingConversations(false);
                return;
            }

            const conversationsRaw = convData ?? [];

            const conversationIds = conversationsRaw
                .map((c: any) => c.id)
                .filter(Boolean) as number[];

            type MessagesAggregate = {
                [conversationId: number]: {
                    text: string;
                    count: number;
                    lastCreatedAt: string | null;
                    messages: {
                        senderId: string;
                        createdAt: string;
                        content: string;
                    }[];
                };
            };

            const messagesAggregate: MessagesAggregate = {};

            if (conversationIds.length > 0) {
                const { data: messagesData, error: messagesError } = await supabase
                    .from("messages")
                    .select("conversation_id, sender_id, content, created_at")
                    .in("conversation_id", conversationIds);

                if (messagesError) {
                    console.error(
                        "Erreur chargement messages pour la recherche :",
                        messagesError,
                    );
                } else {
                    for (const m of messagesData ?? []) {
                        const convId = m.conversation_id as number;

                        if (!messagesAggregate[convId]) {
                            messagesAggregate[convId] = {
                                text: "",
                                count: 0,
                                lastCreatedAt: null,
                                messages: [],
                            };
                        }

                        const createdAt = m.created_at as string;

                        messagesAggregate[convId].text += ` ${m.content ?? ""}`;
                        messagesAggregate[convId].count += 1;
                        messagesAggregate[convId].messages.push({
                            senderId: m.sender_id as string,
                            createdAt,
                            content: m.content ?? "",
                        });

                        if (
                            !messagesAggregate[convId].lastCreatedAt ||
                            createdAt > messagesAggregate[convId].lastCreatedAt!
                        ) {
                            messagesAggregate[convId].lastCreatedAt = createdAt;
                        }
                    }
                }
            }

            const formatted: Conversation[] = conversationsRaw.map((conv: any) => {
                const sellerRow = normalizeRelation(conv.seller);
                const buyerRow = normalizeRelation(conv.buyer);
                const listingRow = normalizeRelation(conv.listing);

                const isCurrentUserSeller = conv.seller_id === user.id;
                const contactProfile = isCurrentUserSeller ? buyerRow : sellerRow;

                const contactName =
                    contactProfile?.display_name ??
                    (isCurrentUserSeller ? "Acheteur inconnu" : "Vendeur inconnu");

                const aggregate = messagesAggregate[conv.id as number] ?? {
                    text: "",
                    count: 0,
                    lastCreatedAt: null,
                    messages: [],
                };

                const lastTimestamp: string | Date | null =
                    (conv.last_message_at as string | null) ?? aggregate.lastCreatedAt;

                const lastReadAt: string | null = isCurrentUserSeller
                    ? (conv.last_read_at_seller as string | null)
                    : (conv.last_read_at_buyer as string | null);

                let unreadCount = 0;
                for (const msg of aggregate.messages) {
                    if (msg.senderId !== user.id) {
                        if (!lastReadAt || msg.createdAt > lastReadAt) {
                            unreadCount++;
                        }
                    }
                }

                return {
                    id: conv.id as number,
                    contactName,
                    contactProfileId: contactProfile?.id ?? null,
                    productTitle: listingRow?.title ?? "Annonce supprimée",
                    listingId: conv.listing_id ?? listingRow?.id ?? null,
                    lastMessagePreview: conv.last_message_preview as string | null,
                    updatedAt: formatConversationTimestamp(lastTimestamp),
                    lastMessageAt: conv.last_message_at ?? aggregate.lastCreatedAt ?? null,
                    unreadCount,
                    buyerId: conv.buyer_id,
                    sellerId: conv.seller_id,
                    contactAvatarUrl: contactProfile?.avatar_url ?? null,
                    listingPrice: listingRow?.price ?? null,
                    messagesSearchText: aggregate.text,
                };
            });

            setConversations(formatted);

            let initialConversationId: ConversationId | null =
                formatted.length > 0 ? formatted[0].id : null;

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

            await markConversationAsRead(selectedConversationId);
        };

        fetchMessages();
    }, [user, selectedConversationId]);

    const handleSendMessage = async (e: FormEvent) => {
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

        if (error || !data) {
            console.error("Erreur envoi message :", error);
            return;
        }

        const sentAt = new Date(data.created_at);

        const newMessage: Message = {
            id: data.id.toString(),
            fromMe: true,
            content: data.content ?? content,
            time: sentAt.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, newMessage]);
        setMessageInput("");

        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedConversationId
                    ? {
                        ...c,
                        lastMessagePreview: newMessage.content,
                        updatedAt: formatConversationTimestamp(sentAt),
                        lastMessageAt: sentAt.toISOString(),
                        messagesSearchText: `${c.messagesSearchText ?? ""} ${newMessage.content}`,
                        unreadCount: c.unreadCount,
                    }
                    : c,
            ),
        );
    };

    const selectedConversation = conversations.find(
        (c) => c.id === selectedConversationId,
    );

    const handleRequestDeleteConversation = (conversation: Conversation) => {
        setConversationToDelete(conversation);
        setDeleteModalOpen(true);
    };

    const handleConfirmDeleteConversation = async () => {
        if (!conversationToDelete || !user) return;

        setIsDeleting(true);

        const conversationId = conversationToDelete.id;

        const { error: messagesError } = await supabase
            .from("messages")
            .delete()
            .eq("conversation_id", conversationId);

        if (messagesError) {
            console.error(
                "Erreur suppression messages de la conversation :",
                messagesError,
            );
            setIsDeleting(false);
            return;
        }

        const { error: convError } = await supabase
            .from("conversations")
            .delete()
            .eq("id", conversationId);

        if (convError) {
            console.error("Erreur suppression conversation :", convError);
            setIsDeleting(false);
            return;
        }

        setMessages([]);

        setConversations((prev) => {
            const updated = prev.filter((c) => c.id !== conversationId);
            setSelectedConversationId(updated.length > 0 ? updated[0].id : null);
            return updated;
        });

        setQuerySellerId(null);
        setQueryListingId(null);

        router.replace("/messages");

        setIsDeleting(false);
        setDeleteModalOpen(false);
        setConversationToDelete(null);
    };

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

    const handleSearch = (value: string) => {
        setSearchTerm(value);

        const raw = value.trim();
        if (!raw) {
            setSearchResults([]);
            return;
        }

        const normalizedQuery = normalizeText(raw);
        const priceToken = extractPriceRaw(raw);
        const queryPrice =
            priceToken !== null ? parseFloat(priceToken) : null;

        const resultsWithScore = conversations
            .map((conv) => {
                const normalizedName = normalizeText(conv.contactName);
                const normalizedTitle = normalizeText(conv.productTitle);
                const normalizedMessages = normalizeText(conv.messagesSearchText ?? "");

                let score = 0;

                if (queryPrice !== null && conv.listingPrice !== null) {
                    const convPrice = conv.listingPrice / 100;
                    if (Math.abs(convPrice - queryPrice) < 0.01) {
                        score += 400;
                    }
                }

                if (normalizedName.includes(normalizedQuery)) {
                    score += 200;
                }

                if (normalizedTitle.includes(normalizedQuery)) {
                    score += 100;
                }

                if (normalizedMessages.includes(normalizedQuery)) {
                    score += 50;
                }

                return { conv, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((item) => item.conv);

        setSearchResults(resultsWithScore);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
    };

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
                {/* Liste des conversations */}
                <Card className="flex flex-col rounded-2xl border p-4">
                    <div className="space-y-3">
                        <p className="text-sm font-semibold">Conversations</p>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Rechercher une conversation"
                                className="h-9 text-sm"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searchTerm && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearSearch}
                                >
                                    Annuler
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="-mt-2 flex flex-1 flex-col gap-2 overflow-y-auto">
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

                        {/* Résultats de recherche */}
                        {searchTerm.trim() && !loadingConversations && (
                            <>
                                {searchResults.length === 0 ? (
                                    <p className="text-[11px] text-muted-foreground">
                                        Aucune conversation ne correspond à votre recherche.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {searchResults.map((conversation) => (
                                            <ConversationItem
                                                key={`search-${conversation.id}`}
                                                conversation={conversation}
                                                isActive={conversation.id === selectedConversationId}
                                                onSelect={() =>
                                                    setSelectedConversationId(conversation.id)
                                                }
                                                onDelete={() =>
                                                    handleRequestDeleteConversation(conversation)
                                                }
                                                highlightTerm={searchTerm}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="my-3 border-t border-border/60" />
                            </>
                        )}

                        {/* Liste complète triée par dernier message */}
                        {!loadingConversations &&
                            [...conversations]
                                .sort((a, b) => {
                                    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
                                    if (!a.lastMessageAt) return 1;
                                    if (!b.lastMessageAt) return -1;
                                    return (
                                        new Date(b.lastMessageAt).getTime() -
                                        new Date(a.lastMessageAt).getTime()
                                    );
                                })
                                .map((conversation) => (
                                    <ConversationItem
                                        key={conversation.id}
                                        conversation={conversation}
                                        isActive={conversation.id === selectedConversationId}
                                        onSelect={() => setSelectedConversationId(conversation.id)}
                                        onDelete={() =>
                                            handleRequestDeleteConversation(conversation)
                                        }
                                    />
                                ))}
                    </div>
                </Card>

                {/* Fil de messages */}
                <Card className="flex flex-col rounded-2xl border p-4">
                    {selectedConversation ? (
                        <>
                            <ThreadHeader
                                conversation={selectedConversation}
                                onDelete={() =>
                                    handleRequestDeleteConversation(selectedConversation)
                                }
                            />

                            <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-muted/40 p-3 text-sm">
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
                                className="flex items-end gap-3"
                            >
                                <div className="flex-1 space-y-1">
                  <textarea
                      id="message"
                      rows={3}
                      className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Écrivez votre message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                  />
                                </div>
                                <Button
                                    type="submit"
                                    className="mb-[6px] h-10 whitespace-nowrap px-4"
                                >
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

            {/* Pop-up de suppression de conversation */}
            <AppModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    setDeleteModalOpen(open);
                    if (!open) {
                        setConversationToDelete(null);
                        setIsDeleting(false);
                    }
                }}
                title="Supprimer la conversation"
                description="Cette action est définitive et ne peut pas être annulée."
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setConversationToDelete(null);
                            }}
                            disabled={isDeleting}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDeleteConversation}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-muted-foreground">
                    Êtes-vous sûr de vouloir supprimer la conversation
                    {conversationToDelete
                        ? ` avec « ${conversationToDelete.contactName} »`
                        : ""}{" "}
                    ?
                </p>
            </AppModal>
        </>
    );
}