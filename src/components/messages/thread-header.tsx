import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types/messages";

interface ThreadHeaderProps {
    conversation: Conversation;
    onDelete: () => void;
}

export function ThreadHeader({ conversation, onDelete }: ThreadHeaderProps) {
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
                    {conversation.contactAvatarUrl && (
                        <AvatarImage
                            src={conversation.contactAvatarUrl}
                            alt={conversation.contactName}
                        />
                    )}
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 text-sm">
                    <p className="font-medium">{conversation.contactName}</p>
                    <p className="text-xs text-muted-foreground">
                        À propos de : {conversation.productTitle}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleViewListing}
                >
                    Voir l’annonce
                </Button>

                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                >
                    Supprimer
                </Button>
            </div>
        </div>
    );
}