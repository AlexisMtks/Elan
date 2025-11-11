"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AccountForm } from "@/components/account/account-form";
import { AccountActivity } from "@/components/account/account-activity";
import { useRequireAuth } from "@/hooks/use-require-auth";

type Stats = {
  listings: number;
  sales: number;
  purchases: number;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone_number: string | null;
};

export function AccountPageClient() {
  const { user, checking } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    listings: 0,
    sales: 0,
    purchases: 0,
  });
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setEmail(user.email ?? "");

      // Profil + stats en parallèle
      const [profileRes, listingsRes, salesRes, purchasesRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, display_name, city, country, avatar_url, bio, phone_number"
            )
            .eq("id", user.id)
            .single(),
          supabase.from("listings").select("id").eq("seller_id", user.id),
          supabase.from("orders").select("id").eq("seller_id", user.id),
          supabase.from("orders").select("id").eq("buyer_id", user.id),
        ]);

      if (profileRes.error) {
        console.error("Erreur chargement profil :", profileRes.error);
        // Fallback minimal si aucun profil
        setProfile({
          id: user.id,
          display_name: user.email ?? "Utilisateur Élan",
          city: null,
          country: null,
          avatar_url: null,
          bio: null,
          phone_number: null,
        });
      } else {
        setProfile(profileRes.data as ProfileRow);
      }

      setStats({
        listings: (listingsRes.data ?? []).length,
        sales: (salesRes.data ?? []).length,
        purchases: (purchasesRes.data ?? []).length,
      });

      setLoading(false);
    };

    load();
  }, [user]);

  if (checking || loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Chargement de votre compte…
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Impossible de charger votre profil pour le moment.
      </p>
    );
  }

  const displayName = profile.display_name || "Utilisateur Élan";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <AccountForm
        profile={{
          displayName,
          city: profile.city,
          country: profile.country,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          phoneNumber: profile.phone_number,
        }}
        email={email}
      />
      <AccountActivity stats={stats} />
    </div>
  );
}
