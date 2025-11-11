"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";

import { PageTitle } from "@/components/misc/page-title";
import { StatCard } from "@/components/misc/stat-card";
import { PieChartPlaceholder } from "@/components/charts/pie-chart-placeholder";
import { MyListingCard } from "@/components/cards/my-listing-card";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";

type UiListingStatus = "active" | "draft" | "ended";

type ListingRow = {
  id: number;
  title: string;
  price: number;
  city: string | null;
  status: string; // 'draft' | 'active' | 'reserved' | 'sold' | 'archived'
  seller_id: string;
};

function mapStatus(dbStatus: string): UiListingStatus {
  if (dbStatus === "draft") return "draft";
  if (dbStatus === "active") return "active";
  // reserved / sold / archived => "terminée" pour l'UI
  return "ended";
}

export default function MyListingsPage() {
  const { user, checking } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, city, status, seller_id")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement annonces :", error);
        setError("Impossible de charger vos annonces pour le moment.");
        setListings([]);
      } else {
        setListings((data ?? []) as ListingRow[]);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  if (checking || loading) {
    return (
      <div className="space-y-3">
        <BackToAccountButton />
        <p className="text-sm text-muted-foreground">
          Chargement de vos annonces…
        </p>
      </div>
    );
  }

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

      {error && (
        <p className="text-sm text-red-600">
          {error}
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
