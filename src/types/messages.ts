// src/types/messages.ts

export type ConversationId = number;

export interface Conversation {
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
    contactAvatarUrl: string | null;
    listingPrice: number | null;
    messagesSearchText: string;
    lastMessageAt: string | null;
}

export interface Message {
    id: string;
    fromMe: boolean;
    content: string;
    time: string;
}

// ✅ Alias pour compat avec d’éventuels anciens imports
export type Messages = Message[];