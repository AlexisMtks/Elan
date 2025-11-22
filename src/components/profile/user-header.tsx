"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RatingStars } from "@/components/rating/rating-stars";
import { useCurrentUser } from "@/hooks/use-current-user";

interface UserHeaderProps {
    profileId: string;          // 👈 id du profil affiché
    name: string;
    location: string;
    listingsCount: number;
    rating: number | null;
    reviewsCount: number;
    avatarUrl?: string | null;
}

export function UserHeader({
                               profileId,
                               name,
                               location,
                               listingsCount,
                               rating,
                               reviewsCount,
                               avatarUrl,
                           }: UserHeaderProps) {
    const router = useRouter();
    const { user: currentUser, checking } = useCurrentUser();

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const handleContact = () => {
        router.push("/messages");
    };

    const effectiveRating = rating ?? 0;

    const isSelf = currentUser?.id === profileId;
    const showContactButton = !checking && !isSelf;

    return (
        <Card className="flex flex-col items-center gap-4 rounded-2xl p-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                    {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={name} />
                    ) : (
                        <AvatarFallback>{initials}</AvatarFallback>
                    )}
                </Avatar>

                <div>
                    <h1 className="text-xl font-semibold">{name}</h1>
                    <p className="text-sm text-muted-foreground">{location}</p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-end">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <RatingStars value={effectiveRating} readOnly size="sm" />

                        {rating !== null && reviewsCount > 0 ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {rating.toFixed(1)} / 5 · {reviewsCount} avis
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Pas encore de note
                            </p>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-2xl font-bold">{listingsCount}</p>
                        <p className="text-xs text-muted-foreground">
                            {listingsCount} annonce
                            {listingsCount > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {showContactButton && (
                    <Button type="button" size="sm" onClick={handleContact}>
                        Contacter
                    </Button>
                )}
            </div>
        </Card>
    );
}