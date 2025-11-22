"use client";

import { RatingStars } from "@/components/rating/rating-stars";
import { ReviewCard } from "@/components/cards/review-card";

export type AccountReview = {
    id: string;
    author: string;
    authorAvatar: string | null;
    reviewerId: string | null;
    rating: number;
    content: string;
};

interface AccountReviewsProps {
    ratingAvg: number | null;      // note moyenne sur 5
    reviewsCount: number;          // nombre total d’avis reçus
    reviews: AccountReview[];      // liste des avis (format ReviewCard)
}

export function AccountReviews({
                                   ratingAvg,
                                   reviewsCount,
                                   reviews,
                               }: AccountReviewsProps) {
    const effectiveRating = ratingAvg ?? 0;
    const hasReviews = reviewsCount > 0 && reviews.length > 0;

    return (
        <div className="space-y-4">
            {/* Header : titre + sous-titre + note moyenne */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Mes avis reçus</h2>
                    <p className="text-sm text-muted-foreground">
                        Les évaluations laissées par les membres après vos transactions.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <RatingStars value={effectiveRating} readOnly size="sm" />

                    {hasReviews ? (
                        <p className="text-xs text-muted-foreground">
                            {(ratingAvg ?? 0).toFixed(1)} / 5 · {reviewsCount} avis
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Aucun avis pour le moment
                        </p>
                    )}
                </div>
            </div>

            {/* Carrousel des avis */}
            {hasReviews ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="w-[300px] flex-shrink-0 px-1"
                        >
                            <ReviewCard review={review} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Dès qu’un membre vous laissera un avis, il apparaîtra ici.
                </p>
            )}
        </div>
    );
}