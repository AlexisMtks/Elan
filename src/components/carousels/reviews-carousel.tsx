"use client";

import { ReviewCard } from "@/components/cards/review-card";

type Review = {
    id: string;
    author: string;
    authorAvatar?: string | null;
    reviewerId?: string | null;
    rating: number;
    content: string;
};

interface ReviewsCarouselProps {
    title: string;
    reviews: Review[];
}

export function ReviewsCarousel({ title, reviews }: ReviewsCarouselProps) {
    if (!reviews || reviews.length === 0) {
        return null;
    }

    return (
        <section className="space-y-3">
            <h2 className="text-base font-semibold">{title}</h2>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="w-[300px] flex-shrink-0 px-1"
                    >
                        <ReviewCard
                            review={{
                                id: review.id,
                                author: review.author,
                                authorAvatar: review.authorAvatar ?? null,
                                reviewerId: review.reviewerId ?? null,
                                rating: review.rating,
                                content: review.content,
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}