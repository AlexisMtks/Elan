import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ReviewCardProps {
    review: {
        author: string;
        rating: number;
        content: string;
    };
}

export function ReviewCard({ review }: ReviewCardProps) {
    return (
        <Card className="space-y-2 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{review.author}</p>
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
            <p className="text-sm text-muted-foreground">{review.content}</p>
        </Card>
    );
}