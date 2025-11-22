"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface ReviewCardProps {
    review: {
        id: string;
        author: string;
        authorAvatar: string | null;
        reviewerId: string | null;
        rating: number;
        content: string;
    };
}

export function ReviewCard({ review }: ReviewCardProps) {
    const authorName = review.author || "Membre Élan";

    const trimmedContent = review.content?.trim() ?? "";
    const hasContent = trimmedContent.length > 0;
    const noComment = review.rating > 0 && !hasContent;

    const initials = authorName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const card = (
        <Card className="space-y-2 rounded-2xl border p-4 transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        {review.authorAvatar ? (
                            <AvatarImage
                                src={review.authorAvatar}
                                alt={authorName}
                            />
                        ) : (
                            <AvatarFallback className="text-xs">
                                {initials}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <p className="text-sm font-medium">{authorName}</p>
                </div>

                <div className="flex gap-0.5 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "currentColor" : "none"}
                        />
                    ))}
                </div>
            </div>

            {noComment ? (
                <p className="text-sm text-muted-foreground italic">
                    Cet acheteur n&apos;a pas laissé de commentaire.
                </p>
            ) : hasContent ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {trimmedContent}
                </p>
            ) : null}
        </Card>
    );

    if (review.reviewerId) {
        return (
            <Link
                href={`/profile/${review.reviewerId}`}
                className="block cursor-pointer"
            >
                {card}
            </Link>
        );
    }

    return card;
}