import { ReviewCard } from "@/components/cards/review-card";

interface Review {
    id: string;
    author: string;
    rating: number;
    content: string;
}

interface ReviewsCarouselProps {
    title: string;
    reviews: Review[];
}

export function ReviewsCarousel({ title, reviews }: ReviewsCarouselProps) {
    if (!reviews.length) return null;

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold">{title}</h2>

            <div className="-mx-1 flex gap-4 overflow-x-auto pb-1">
                {reviews.map((review) => (
                    <div key={review.id} className="w-[300px] flex-shrink-0 px-1">
                        <ReviewCard review={review} />
                    </div>
                ))}
            </div>
        </section>
    );
}