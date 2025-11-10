import { PageTitle } from "@/components/misc/page-title";
import { StatCard } from "@/components/misc/stat-card";
import { PieChartPlaceholder } from "@/components/charts/pie-chart-placeholder";
import { MyListingCard } from "@/components/cards/my-listing-card";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";
import { supabase } from "@/lib/supabaseClient";

type UiListingStatus = "active" | "draft" | "ended";

type ListingRow = {
    id: number;
    title: string;
    price: number;
    city: string | null;
    status: string; // 'draft' | 'active' | 'reserved' | 'sold' | 'archived'
    seller_id: string;
};

// ⚠️ TEMPORAIRE : on simule l'utilisateur connecté = Marie
// Quand l'auth sera branchée, on remplacera ça par auth.uid()
const CURRENT_USER_ID = "87dd7120-b634-4cbc-a67b-c134fb1a0c15";

function mapStatus(dbStatus: string): UiListingStatus {
    if (dbStatus === "draft") return "draft";
    if (dbStatus === "active") return "active";
    // reserved / sold / archived => "terminée" pour l'UI
    return "ended";
}

export default async function MyListingsPage() {
    const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, city, status, seller_id")
        .eq("seller_id", CURRENT_USER_ID)
        .order("created_at", { ascending: false });

    const listings = (data ?? []) as ListingRow[];

    const activeListings = listings.filter((l) => l.status === "active");
    const draftListings = listings.filter((l) => l.status === "draft");
    const endedListings = listings.filter((l) =>
        ["reserved", "sold", "archived"].includes(l.status)
    );

    const activeCount = activeListings.length;
    const draftCount = draftListings.length;
    const endedCount = endedListings.length;
    const totalCount = activeCount + draftCount + endedCount;

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
                        helper="Toutes vos annonces, actives, brouillons et terminées."
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

            {/* Message d'erreur éventuel (Supabase) */}
            {error && (
                <p className="text-sm text-red-600">
                    Impossible de charger vos annonces pour le moment.
                </p>
            )}

            {/* Publications actives */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Publications actives</h2>

                {activeListings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Vous n’avez pas encore d’annonce active.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {activeListings.map((listing) => (
                            <MyListingCard
                                key={listing.id}
                                id={listing.id.toString()}
                                title={listing.title}
                                price={listing.price / 100}
                                location={listing.city ?? "Non renseigné"}
                                status={mapStatus(listing.status)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Brouillons */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Brouillons</h2>

                {draftListings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Vous n’avez pas de brouillon pour le moment.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {draftListings.map((listing) => (
                            <MyListingCard
                                key={listing.id}
                                id={listing.id.toString()}
                                title={listing.title}
                                price={listing.price / 100}
                                location={listing.city ?? "Non renseigné"}
                                status={mapStatus(listing.status)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}