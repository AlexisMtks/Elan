import { MouseEvent, KeyboardEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppIcon } from "@/components/misc/app-icon";
import type { Conversation } from "@/types/messages";

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    highlightTerm?: string;
}

function buildSnippet(text: string, term?: string, max = 40) {
    if (!text) return "";
    if (text.length <= max) return text;

    const cleanTerm = term?.trim();
    if (!cleanTerm) {
        return text.slice(0, max) + "…";
    }

    const lowerText = text.toLowerCase();
    const lowerTerm = cleanTerm.toLowerCase();

    const index = lowerText.indexOf(lowerTerm);
    if (index === -1) {
        return text.slice(0, max) + "…";
    }

    const half = Math.floor((max - lowerTerm.length) / 2);
    let start = Math.max(0, index - half);
    let end = Math.min(text.length, start + max);

    if (end - start < max && start > 0) {
        start = Math.max(0, end - max);
    }

    let snippet = text.slice(start, end);
    if (start > 0) snippet = "…" + snippet;
    if (end < text.length) snippet = snippet + "…";

    return snippet;
}

function highlightMatch(text: string, term?: string) {
    if (!term?.trim()) return text;

    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();

    const index = lowerText.indexOf(lowerTerm);
    if (index === -1) return text;

    const end = index + lowerTerm.length;

    return (
        <>
            {text.slice(0, index)}
            <span className="rounded-sm bg-amber-100 px-[2px]">
        {text.slice(index, end)}
      </span>
            {text.slice(end)}
        </>
    );
}

export function ConversationItem({
                                     conversation,
                                     isActive,
                                     onSelect,
                                     onDelete,
                                     highlightTerm,
                                 }: ConversationItemProps) {
    const initials =
        conversation.contactName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "EL";

    const hasUnread = conversation.unreadCount > 0;

    const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onDelete();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={handleKeyDown}
            className={[
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs transition",
                isActive
                    ? "border-foreground bg-foreground/10 shadow-sm"
                    : hasUnread
                        ? "border-foreground/40"
                        : "border-transparent hover:bg-muted/60",
            ].join(" ")}
        >
            <div className="flex items-center gap-2">
                {hasUnread && !isActive && (
                    <span
                        className="h-2 w-2 rounded-full bg-foreground"
                        aria-hidden="true"
                    />
                )}

                <Avatar className="h-8 w-8">
                    {conversation.contactAvatarUrl && (
                        <AvatarImage
                            src={conversation.contactAvatarUrl}
                            alt={conversation.contactName}
                        />
                    )}
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </div>

            <div className="flex-1 space-y-0.5">
                <p className={`text-xs ${hasUnread ? "font-semibold" : "font-medium"}`}>
                    {highlightMatch(conversation.contactName, highlightTerm)}
                </p>

                {/* Ligne 2 : en recherche → extrait du message, sinon titre de l'annonce */}
                <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    {highlightTerm
                        ? highlightMatch(
                            buildSnippet(
                                conversation.messagesSearchText ?? "",
                                highlightTerm,
                                40,
                            ),
                            highlightTerm,
                        )
                        : highlightMatch(conversation.productTitle, highlightTerm)}
                </p>

                {/* Ligne 3 : dernier message */}
                {conversation.lastMessagePreview && (
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">
                        {highlightMatch(
                            buildSnippet(
                                conversation.lastMessagePreview,
                                highlightTerm,
                                40,
                            ),
                            highlightTerm,
                        )}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground/10 px-1 text-[10px] font-medium text-foreground">
              {conversation.unreadCount}
            </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
            {conversation.updatedAt}
          </span>
                </div>

                <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                    aria-label="Supprimer cette conversation"
                >
                    <AppIcon name="trash" size={14} />
                </button>
            </div>
        </div>
    );
}