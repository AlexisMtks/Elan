"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AccountForm } from "@/components/account/account-form";
import { AccountActivity } from "@/components/account/account-activity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type Stats = {
    listings: number;
    sales: number;
    purchases: number;
};

type ProfileRow = {
    id: string;
    display_name: string | null;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    gender: "female" | "male" | "other" | "unspecified" | null;
    city: string | null;
    country: string | null;
    avatar_url: string | null;
    bio: string | null;
    phone_number: string | null;
};

type AddressRow = {
    line1: string | null;
    line2: string | null;
    city: string | null;
    postcode: string | null;
    country: string | null;
};

export function AccountPageClient() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        listings: 0,
        sales: 0,
        purchases: 0,
    });
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [address, setAddress] = useState<AddressRow | null>(null);
    const [email, setEmail] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErrorMsg(null);

            // 1) Utilisateur connecté
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setErrorMsg("Vous devez être connecté pour accéder à cette page.");
                setLoading(false);
                return;
            }

            setEmail(user.email ?? "");
            setUserId(user.id); // on garde l'id pour l'upload d'avatar

            // 2) Profil + stats + adresse en parallèle
            const [profileRes, listingsRes, salesRes, purchasesRes, addressRes] =
                await Promise.all([
                    supabase
                        .from("profiles")
                        .select(
                            "id, display_name, username, first_name, last_name, gender, city, country, avatar_url, bio, phone_number",
                        )
                        .eq("id", user.id)
                        .single(),
                    supabase
                        .from("listings")
                        .select("id")
                        .eq("seller_id", user.id)
                        .in("status", ["draft", "active", "sold"]),
                    supabase.from("orders").select("id").eq("seller_id", user.id),
                    supabase.from("orders").select("id").eq("buyer_id", user.id),
                    supabase
                        .from("addresses")
                        .select("line1, line2, city, postcode, country")
                        .eq("user_id", user.id)
                        // .order("created_at", { ascending: false })
                        .limit(1)
                        .maybeSingle(),
                ]);

            if (profileRes.error) {
                // Fallback minimal si le profil n’existe pas encore (rare, mais possible)
                console.error("Erreur chargement profil :", profileRes.error);
                setProfile({
                    id: user.id,
                    display_name:
                        user.user_metadata?.display_name ??
                        user.email ??
                        "Utilisateur Élan",
                    username: user.user_metadata?.username ?? null,
                    first_name: user.user_metadata?.first_name ?? null,
                    last_name: user.user_metadata?.last_name ?? null,
                    gender: user.user_metadata?.gender ?? null,
                    city: user.user_metadata?.city ?? null,
                    country: user.user_metadata?.country ?? null,
                    avatar_url: user.user_metadata?.avatar_url ?? null,
                    bio: user.user_metadata?.bio ?? null,
                    phone_number: user.user_metadata?.phone_number ?? null,
                });
            } else {
                setProfile(profileRes.data as ProfileRow);
            }

            if (!addressRes.error && addressRes.data) {
                setAddress(addressRes.data as AddressRow);
            } else {
                // Si pas d’adresse en base, tenter depuis les métadonnées d’inscription
                setAddress({
                    line1: user.user_metadata?.address_line1 ?? null,
                    line2: null,
                    city: user.user_metadata?.city ?? null,
                    postcode: user.user_metadata?.postcode ?? null,
                    country: user.user_metadata?.country ?? null,
                });
            }

            setStats({
                listings: (listingsRes.data ?? []).length,
                sales: (salesRes.data ?? []).length,
                purchases: (purchasesRes.data ?? []).length,
            });

            setLoading(false);
        };

        load();
    }, []);

    // Callback passé au formulaire pour uploader l'avatar
    const handleAvatarChange = async (file: File) => {
        if (!userId) return;

        try {
            setErrorMsg(null);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("userId", userId);

            const res = await fetch("/api/account/avatar", {
                method: "POST",
                body: formData,
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                console.error("Avatar upload API error:", data);
                setErrorMsg(
                    data?.error ?? "Erreur lors de l’upload de la photo de profil.",
                );
                return;
            }

            setProfile((prev) =>
                prev
                    ? {
                        ...prev,
                        avatar_url: data.publicUrl,
                    }
                    : prev,
            );
        } catch (err) {
            console.error("Erreur upload avatar (client):", err);
            setErrorMsg("Erreur lors de l’upload de la photo de profil.");
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">
                Chargement de votre compte…
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="space-y-3 text-sm">
                <p className="text-red-500">{errorMsg}</p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/login">Aller à la page de connexion</Link>
                </Button>
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

    const displayName =
        profile.display_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        "Utilisateur Élan";

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Card className="rounded-2xl border p-6">
                <AccountForm
                    profile={{
                        username: profile.username,
                        firstName: profile.first_name,
                        lastName: profile.last_name,
                        displayName,
                        city: profile.city,
                        country: profile.country,
                        avatarUrl: profile.avatar_url,
                        bio: profile.bio,
                        phoneNumber: profile.phone_number,
                        gender: profile.gender,
                    }}
                    email={email}
                    address={{
                        line1: address?.line1 ?? null,
                        postcode: address?.postcode ?? null,
                        city: address?.city ?? profile.city ?? null,
                        country: address?.country ?? profile.country ?? null,
                    }}
                    onAvatarChange={handleAvatarChange}
                />
            </Card>

            <Card className="rounded-2xl border p-6">
                <AccountActivity stats={stats} />
            </Card>
        </div>
    );
}