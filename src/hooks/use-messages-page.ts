// src/hooks/use-messages-page.ts
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Conversation, ConversationId, Message } from "@/types/messages";
import {
    normalizeRelation,
    formatConversationTimestamp,
    searchConversations,
} from "@/lib/messages-utils";

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

export function useMessagesPage() {
    const { user, checking } = useRequireAuth();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Conversation[]>([]);

    const [conversationCreated, setConversationCreated] = useState(false);

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

    const selectedConversation =
        conversations.find((c) => c.id === selectedConversationId) ?? null;

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

    // Chargement / sync des conversations
    useEffect(() => {
        if (!user) return;

        const syncConversations = async () => {
            setLoadingConversations(true);

            // 1) Création éventuelle de la conversation si on vient d'une annonce
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

            // 2) Chargement de toutes les conversations
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

            // 3) Chargement des messages pour agrégation (search + last read)
            const conversationIds = conversationsRaw
                .map((c: any) => c.id)
                .filter(Boolean) as number[];

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

            // 4) Choix de la conversation sélectionnée
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

        void syncConversations();
    }, [user, querySellerId, queryListingId, conversationCreated]);

    // Chargement des messages pour la conversation sélectionnée
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

        void fetchMessages();
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

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        const results = searchConversations(conversations, value);
        setSearchResults(results);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleSelectConversation = (id: ConversationId) => {
        setSelectedConversationId(id);
    };

    const handleRequestDeleteConversation = (conversation: Conversation) => {
        setConversationToDelete(conversation);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setConversationToDelete(null);
        setIsDeleting(false);
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
        handleCloseDeleteModal();
    };

    return {
        // auth
        user,
        checking,

        // recherche
        searchTerm,
        searchResults,
        handleSearch,
        handleClearSearch,

        // conversations
        conversations,
        selectedConversationId,
        selectedConversation,
        loadingConversations,
        handleSelectConversation,
        handleRequestDeleteConversation,

        // messages
        messages,
        messageInput,
        setMessageInput,
        loadingMessages,
        handleSendMessage,

        // suppression
        deleteModalOpen,
        conversationToDelete,
        isDeleting,
        handleConfirmDeleteConversation,
        handleCloseDeleteModal,
    };
}