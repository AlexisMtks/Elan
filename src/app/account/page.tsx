// src/app/account/page.tsx
import { PageTitle } from "@/components/misc/page-title";
import { AccountForm } from "@/components/account/account-form";
import { AccountActivity } from "@/components/account/account-activity";
import { supabase } from "@/lib/supabaseClient";

// ⚠️ TEMP : on simule l'utilisateur connecté (Marie)
// Plus tard : à remplacer par l'ID Supabase de l'utilisateur authentifié
const CURRENT_USER_ID = "6bdba68b-2e77-4199-9e9b-bd1d1caac7d6";

export default async function AccountPage() {
    const [{ data: listings }, { data: salesOrders }, { data: purchaseOrders }] =
        await Promise.all([
            // Annonces où je suis vendeur
            supabase
                .from("listings")
                .select("id")
                .eq("seller_id", CURRENT_USER_ID),

            // Commandes où je suis vendeur
            supabase
                .from("orders")
                .select("id")
                .eq("seller_id", CURRENT_USER_ID),

            // Commandes où je suis acheteur
            supabase
                .from("orders")
                .select("id")
                .eq("buyer_id", CURRENT_USER_ID),
        ]);

    const stats = {
        listings: (listings ?? []).length,
        sales: (salesOrders ?? []).length,
        purchases: (purchaseOrders ?? []).length,
    };

    return (
        <div className="space-y-10">
            <PageTitle
                title="Mon compte"
                subtitle="Gérez vos informations personnelles et accédez à votre activité."
            />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <AccountForm />
                <AccountActivity stats={stats} />
            </div>
        </div>
    );
}
