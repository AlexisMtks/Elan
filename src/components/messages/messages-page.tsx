"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ConversationId = string;

interface Conversation {
    id: ConversationId;
    contactName: string;
    productTitle: string;
    lastMessagePreview: string;
    updatedAt: string;
    unreadCount: number;
}

interface Message {
    id: string;
    fromMe: boolean;
    content: string;
    time: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        contactName: "Pierre Durand",
        productTitle: "Cheval d’arçons",
        lastMessagePreview: "Parfait, je peux passer samedi matin.",
        updatedAt: "Aujourd’hui • 10:15",
        unreadCount: 2,
    },
    {
        id: "2",
        contactName: "Club Gym Lyon",
        productTitle: "Poutre d’équilibre 2m",
        lastMessagePreview: "Merci pour votre réponse, je confirme.",
        updatedAt: "Hier • 18:42",
        unreadCount: 0,
    },
    {
        id: "3",
        contactName: "Sophie Martin",
        productTitle: "Justaucorps rouge taille 36",
        lastMessagePreview: "Je vous envoie les photos complémentaires.",
        updatedAt: "3 avril • 14:20",
        unreadCount: 0,
    },
];

const MOCK_MESSAGES_BY_CONVERSATION: Record<ConversationId, Message[]> = {
    "1": [
        {
            id: "m1",
            fromMe: false,
            content: "Bonjour, l’article est-il toujours disponible ?",
            time: "09:02",
        },
        {
            id: "m2",
            fromMe: true,
            content: "Oui, il est toujours disponible.",
            time: "09:10",
        },
        {
            id: "m3",
            fromMe: false,
            content: "Parfait, je peux passer samedi matin.",
            time: "10:15",
        },
    ],
    "2": [
        {
            id: "m4",
            fromMe: true,
            content: "Merci pour votre commande, l’envoi est prévu demain.",
            time: "Hier • 18:42",
        },
    ],
    "3": [
        {
            id: "m5",
            fromMe: false,
            content: "Je vous envoie les photos complémentaires.",
            time: "3 avril • 14:20",
        },
    ],
};

/**
 * Page principale de messagerie : liste de conversations + fil de messages.
 * Toutes les actions sont simulées (alert) pour ce MVP.
 */
export function MessagesPage() {
    const [selectedConversationId, setSelectedConversationId] =
        useState<ConversationId | null>("1");
    const [messageInput, setMessageInput] = useState("");

    const selectedConversation = MOCK_CONVERSATIONS.find(
        (conv) => conv.id === selectedConversationId
    );
    const messages = selectedConversationId
        ? MOCK_MESSAGES_BY_CONVERSATION[selectedConversationId] ?? []
        : [];

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        alert(
            `Simulation : envoi du message à ${selectedConversation.contactName} :\n\n"${messageInput}"`
        );
        setMessageInput("");
    };

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
                    {MOCK_CONVERSATIONS.map((conversation) => (
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
                                    Aucun message pour le moment. Commencez la conversation en
                                    envoyant un premier message.
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
                <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    {conversation.lastMessagePreview}
                </p>
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