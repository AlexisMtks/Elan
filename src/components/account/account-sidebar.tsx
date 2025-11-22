"use client";

import { AccountActivity } from "@/components/account/account-activity";

type Stats = {
    listings: number;
    sales: number;
    purchases: number;
};

interface AccountSidebarProps {
    stats: Stats;
    // TODO: plus tard on pourra ajouter ici :
    // ratingAvg?: number;
    // reviewsCount?: number;
    // latestReviews?: Array<...>;
    // friendsCount?: number;
}

export function AccountSidebar({ stats }: AccountSidebarProps) {
    return (
        <div className="space-y-6">
            <AccountActivity stats={stats} />

            {/*
              🔜 Zone prête pour d’autres widgets :
              - résumé de la note moyenne
              - carrousel des derniers avis
              - accès rapide aux amis / favoris
            */}
            {/* <AccountReviewSummary ... /> */}
            {/* <AccountFriendsPreview ... /> */}
        </div>
    );
}