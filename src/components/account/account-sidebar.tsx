"use client";

import { AccountActivity } from "@/components/account/account-activity";
import { AccountReviews, AccountReview } from "@/components/account/account-reviews";

type Stats = {
    listings: number;
    sales: number;
    purchases: number;
};

interface AccountSidebarProps {
    stats: Stats;
    ratingAvg: number | null;
    reviewsCount: number;
    reviews: AccountReview[];
}

export function AccountSidebar({
                                   stats,
                                   ratingAvg,
                                   reviewsCount,
                                   reviews,
                               }: AccountSidebarProps) {
    return (
        <div className="space-y-6">
            <AccountActivity stats={stats} />

            <AccountReviews
                ratingAvg={ratingAvg}
                reviewsCount={reviewsCount}
                reviews={reviews}
            />

            {/* 🔜 plus tard : amis, favoris, etc. */}
        </div>
    );
}