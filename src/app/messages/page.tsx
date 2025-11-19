"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/modals/app-modal";

import { ConversationItem } from "@/components/messages/conversation-item";
import { ThreadHeader } from "@/components/messages/thread-header";
import { MessageBubble } from "@/components/messages/message-bubble";
import { useMessagesPage } from "@/hooks/use-messages-page";

export default function MessagesPage() {
    const {
        user,
        checking,

        searchTerm,
        searchResults,
        handleSearch,
        handleClearSearch,

        conversations,
        selectedConversationId,
        selectedConversation,
        loadingConversations,
        handleSelectConversation,
        handleRequestDeleteConversation,

        messages,
        messageInput,
        setMessageInput,
        loadingMessages,
        handleSendMessage,

        deleteModalOpen,
        conversationToDelete,
        isDeleting,
        handleConfirmDeleteConversation,
        handleCloseDeleteModal,
    } = useMessagesPage();

    // ÉTATS D’AUTH (identiques à avant)
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
                                                    handleSelectConversation(conversation.id)
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
                                        onSelect={() => handleSelectConversation(conversation.id)}
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
                    if (!open) {
                        handleCloseDeleteModal();
                    }
                }}
                title="Supprimer la conversation"
                description="Cette action est définitive et ne peut pas être annulée."
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseDeleteModal}
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