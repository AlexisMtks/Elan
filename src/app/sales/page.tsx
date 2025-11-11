"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";

import { PageTitle } from "@/components/misc/page-title";
import { SalesOverview } from "@/components/sales/sales-overview";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";
import { MySaleCard } from "@/components/cards/my-sale-card";

type SaleStatus = "in_progress" | "delivered" | "cancelled";

type OrderItemRow = {
  title_snapshot: string | null;
  price_snapshot: number | null;
};

type OrderRow = {
  id: number;
  created_at: string;
  status: string;
  total_amount: number | null;
  buyer: { display_name: string }[] | null;
  order_items: OrderItemRow[] | null;
};

function mapOrderStatusToSaleStatus(status: string): SaleStatus {
  if (status === "delivered") return "delivered";
  if (status === "cancelled") return "cancelled";
  return "in_progress"; // pending, paid, processing, shipped...
}

export default function MySalesPage() {
  const { user, checking } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
        id,
        created_at,
        status,
        total_amount,
        buyer:profiles!orders_buyer_id_fkey(display_name),
        order_items (
          title_snapshot,
          price_snapshot
        )
      `
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement ventes :", error);
        setError("Impossible de charger vos ventes pour le moment.");
        setOrders([]);
      } else {
        setOrders((data ?? []) as OrderRow[]);
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
          Chargement de vos ventes…
        </p>
      </div>
    );
  }

  // Stats pour SalesOverview
  const totalGainCents = orders.reduce(
    (sum, order) => sum + (order.total_amount ?? 0),
    0
  );
  const salesCount = orders.length;
  const averageGainPerSaleCents = salesCount
    ? totalGainCents / salesCount
    : 0;

  // Pour l’instant on ne calcule pas vraiment l’écart de prix
  const totalPriceDiff = 0;
  const averagePriceDiffPercent = 0;

  const stats = {
    totalGain: totalGainCents / 100,
    averageGainPerSale: averageGainPerSaleCents / 100,
    totalPriceDiff,
    averagePriceDiffPercent,
  };

  return (
    <div className="space-y-10">
      <BackToAccountButton />
      <PageTitle
        title="Mes ventes"
        subtitle="Visualisez vos performances de vente et l’historique de vos commandes."
      />

      <SalesOverview stats={stats} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Historique de mes ventes</h2>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {orders.length === 0 && !error ? (
          <p className="text-sm text-muted-foreground">
            Vous n’avez pas encore réalisé de vente.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {orders.map((order) => {
              const firstItem = order.order_items?.[0] ?? null;
              const title =
                firstItem?.title_snapshot ?? `Commande #${order.id}`;
              const priceCents =
                order.total_amount ?? firstItem?.price_snapshot ?? 0;
              const buyerName =
                order.buyer?.[0]?.display_name ?? "Acheteur inconnu";
              const date = new Date(order.created_at).toLocaleDateString(
                "fr-FR"
              );
              const status = mapOrderStatusToSaleStatus(order.status);

              return (
                <MySaleCard
                  key={order.id}
                  id={order.id.toString()}
                  title={title}
                  price={priceCents / 100}
                  buyer={buyerName}
                  date={date}
                  status={status}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
