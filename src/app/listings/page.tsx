import { PageTitle } from "@/components/misc/page-title";
import { StatCard } from "@/components/misc/stat-card";
import { PieChartPlaceholder } from "@/components/charts/pie-chart-placeholder";
import { MyListingCard } from "@/components/cards/my-listing-card";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";

const MOCK_ACTIVE_LISTINGS = [
    {
        id: "1",
        title: "Tapis de gymnastique 2m",
        price: 120,
        location: "Paris",
        status: "active" as const,
    },
    {
        id: "2",
        title: "Poutre d’équilibre bois",
        price: 260,
        location: "Lyon",
        status: "active" as const,
    },
];

const MOCK_DRAFT_LISTINGS = [
    {
        id: "3",
        title: "Barres asymétriques",
        price: 780,
        location: "Marseille",
        status: "draft" as const,
    },
];

export default function MyListingsPage() {
    const activeCount = MOCK_ACTIVE_LISTINGS.length;
    const draftCount = MOCK_DRAFT_LISTINGS.length;
    const totalCount = activeCount + draftCount;
    const endedCount = 3; // valeur mockée pour coller au wireframe

    return (
        <div className="space-y-10">
            <BackToAccountButton />
            <PageTitle
                title="Mes annonces"
                subtitle="Consultez et gérez vos annonces actives et vos brouillons."
            />

            {/* Stats + camembert */}
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Total d’annonces"
                        value={totalCount}
                        helper="Toutes vos annonces, actives et brouillons."
                    />
                    <StatCard
                        label="Annonces actives"
                        value={activeCount}
                        helper="Actuellement visibles sur la plateforme."
                    />
                    <StatCard
                        label="Annonces terminées"
                        value={endedCount}
                        helper="Annonces clôturées ou vendues."
                    />
                </div>

                <PieChartPlaceholder
                    title="Répartition des annonces"
                    activeCount={activeCount}
                    draftCount={draftCount}
                />
            </section>

            {/* Publications actives */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Publications actives</h2>

                {MOCK_ACTIVE_LISTINGS.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Vous n’avez pas encore d’annonce active.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {MOCK_ACTIVE_LISTINGS.map((listing) => (
                            <MyListingCard
                                key={listing.id}
                                id={listing.id}
                                title={listing.title}
                                price={listing.price}
                                location={listing.location}
                                status={listing.status}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Brouillons */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Brouillons</h2>

                {MOCK_DRAFT_LISTINGS.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Vous n’avez pas de brouillon pour le moment.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {MOCK_DRAFT_LISTINGS.map((listing) => (
                            <MyListingCard
                                key={listing.id}
                                id={listing.id}
                                title={listing.title}
                                price={listing.price}
                                location={listing.location}
                                status={listing.status}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}