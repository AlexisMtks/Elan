"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AccountForm } from "@/components/account/account-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppModal } from "@/components/modals/app-modal";
import { changePassword } from "@/lib/auth/changePassword";
import Link from "next/link";
import { AvatarCropperDialog } from "@/components/avatar/avatar-cropper-dialog";
import { AccountSidebar } from "@/components/account/account-sidebar";
import type { AccountReview } from "@/components/account/account-reviews";

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

type AccountFormValues = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    postcode: string;
    city: string;
    country: string;
    gender: "female" | "male" | "other" | "unspecified";
};

// 🔹 ce type correspond aux lignes "reviews" côté Supabase
type ReviewRow = {
    id: string;
    rating: number;
    comment: string | null;
    reviewer: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    }[] | null; // 👈 tableau, pas objet
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
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    // 🔹 États pour le recadrage d'avatar
    const [rawAvatarFile, setRawAvatarFile] = useState<File | null>(null);
    const [croppedAvatarBlob, setCroppedAvatarBlob] = useState<Blob | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
    const [avatarCropperOpen, setAvatarCropperOpen] = useState(false);

    // 🔹 États pour les avis du compte
    const [ratingAvg, setRatingAvg] = useState<number | null>(null);
    const [reviewsCount, setReviewsCount] = useState<number>(0);
    const [reviews, setReviews] = useState<AccountReview[]>([]);

    // Nettoyage de l'URL de prévisualisation à l'unmount
    useEffect(() => {
        return () => {
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
        };
    }, [avatarPreviewUrl]);

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
            setUserId(user.id);

            // 2) Profil + stats + adresse + avis en parallèle
            const [
                profileRes,
                listingsRes,
                salesRes,
                purchasesRes,
                addressRes,
                reviewsRes,
            ] = await Promise.all([
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
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from("reviews")
                    .select(`
            id,
            rating,
            comment,
            reviewer:profiles!reviews_reviewer_id_fkey(
              id,
              display_name,
              avatar_url
            )
          `)
                    .eq("reviewed_id", user.id)
                    .order("created_at", { ascending: false }),
            ]);

            // Profil
            if (profileRes.error) {
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

            // Adresse
            if (!addressRes.error && addressRes.data) {
                setAddress(addressRes.data as AddressRow);
            } else {
                setAddress({
                    line1: user.user_metadata?.address_line1 ?? null,
                    line2: null,
                    city: user.user_metadata?.city ?? null,
                    postcode: user.user_metadata?.postcode ?? null,
                    country: user.user_metadata?.country ?? null,
                });
            }

            // Stats
            setStats({
                listings: (listingsRes.data ?? []).length,
                sales: (salesRes.data ?? []).length,
                purchases: (purchasesRes.data ?? []).length,
            });

            // Avis reçus
            if (!reviewsRes.error && reviewsRes.data) {
                const rows = (reviewsRes.data ?? []) as ReviewRow[];

                const mapped: AccountReview[] = rows.map((r) => {
                    const reviewer = r.reviewer?.[0]; // 👈 on prend le premier profil lié

                    return {
                        id: r.id,
                        author: reviewer?.display_name ?? "Membre Élan",
                        authorAvatar: reviewer?.avatar_url ?? null,
                        reviewerId: reviewer?.id ?? null,
                        rating: r.rating ?? 0,
                        content: r.comment ?? "",
                    };
                });

                setReviews(mapped);
                setReviewsCount(rows.length);

                if (rows.length > 0) {
                    const avg =
                        rows.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
                        rows.length;
                    setRatingAvg(avg);
                } else {
                    setRatingAvg(null);
                }
            } else {
                if (reviewsRes.error) {
                    console.error("Erreur chargement avis compte:", reviewsRes.error);
                }
                setReviews([]);
                setReviewsCount(0);
                setRatingAvg(null);
            }

            setLoading(false);
        };

        load();
    }, [avatarPreviewUrl]);

    // 🔹 Quand l'utilisateur choisit un nouveau fichier avatar (depuis AccountForm)
    const handleAvatarFileSelected = (file: File | null) => {
        if (!file) {
            setRawAvatarFile(null);
            setCroppedAvatarBlob(null);
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
                setAvatarPreviewUrl(null);
            }
            return;
        }

        setRawAvatarFile(file);
        setAvatarCropperOpen(true);
    };

    // 🔹 Quand le recadrage est validé dans le modal
    const handleAvatarCropped = (blob: Blob) => {
        setCroppedAvatarBlob(blob);

        // On met à jour l’aperçu local
        const url = URL.createObjectURL(blob);
        setAvatarPreviewUrl((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return url;
        });
    };

    const handleDeleteAvatar = async () => {
        if (!userId) return;

        setErrorMsg(null);

        try {
            const res = await fetch(`/api/account/avatar?userId=${userId}`, {
                method: "DELETE",
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                console.error("Erreur suppression avatar:", data);
                setErrorMsg(
                    data?.error ?? "Erreur lors de la suppression de la photo de profil.",
                );
                return;
            }

            // reset des états locaux
            setCroppedAvatarBlob(null);
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
                setAvatarPreviewUrl(null);
            }
            setRawAvatarFile(null);

            setProfile((prev) =>
                prev
                    ? {
                        ...prev,
                        avatar_url: null,
                    }
                    : prev,
            );

            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("elan:avatar-updated", {
                        detail: { avatarUrl: null },
                    }),
                );
            }
        } catch (err) {
            console.error("Erreur suppression avatar (client):", err);
            setErrorMsg("Erreur lors de la suppression de la photo de profil.");
        }
    };

    const handleAccountSubmit = async (values: AccountFormValues) => {
        if (!userId) return;

        setErrorMsg(null);

        // 1. Mettre à jour l'email d'authentification si nécessaire
        if (values.email && values.email !== email) {
            const { error: emailError } = await supabase.auth.updateUser({
                email: values.email,
            });

            if (emailError) {
                console.error("Erreur mise à jour de l'email:", emailError);
                setErrorMsg("Impossible de mettre à jour l'e-mail.");
                return;
            }

            setEmail(values.email);
        }

        // 2. Mettre à jour le profil
        const displayName =
            [values.firstName, values.lastName].filter(Boolean).join(" ") ||
            values.username ||
            profile?.display_name ||
            values.email;

        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                username: values.username || null,
                first_name: values.firstName || null,
                last_name: values.lastName || null,
                display_name: displayName,
                phone_number: values.phone || null,
                city: values.city || null,
                country: values.country || null,
                gender: values.gender,
            })
            .eq("id", userId);

        if (profileError) {
            console.error("Erreur mise à jour du profil:", profileError);
            setErrorMsg("Erreur lors de la mise à jour du profil.");
            return;
        }

        setProfile((prev) =>
            prev
                ? {
                    ...prev,
                    username: values.username || null,
                    first_name: values.firstName || null,
                    last_name: values.lastName || null,
                    display_name: displayName,
                    phone_number: values.phone || null,
                    city: values.city || null,
                    country: values.country || null,
                    gender: values.gender,
                }
                : prev,
        );

        // 3. Upsert de l'adresse
        const hasAddress =
            values.addressLine1.trim() &&
            values.city.trim() &&
            values.postcode.trim() &&
            values.country.trim();

        if (hasAddress) {
            const { error: addressError } = await supabase
                .from("addresses")
                .upsert(
                    {
                        user_id: userId,
                        line1: values.addressLine1.trim(),
                        city: values.city.trim(),
                        postcode: values.postcode.trim(),
                        country: values.country.trim(),
                    },
                    {
                        onConflict: "user_id",
                    },
                );

            if (addressError) {
                console.error("Erreur mise à jour de l'adresse:", addressError);
                setErrorMsg("Erreur lors de la mise à jour de l'adresse.");
                return;
            }

            setAddress({
                line1: values.addressLine1.trim(),
                line2: address?.line2 ?? null,
                city: values.city.trim(),
                postcode: values.postcode.trim(),
                country: values.country.trim(),
            });
        }

        // 4. Upload de la nouvelle photo de profil
        const avatarFileToUpload = croppedAvatarBlob
            ? new File([croppedAvatarBlob], "avatar.jpg", { type: "image/jpeg" })
            : null;

        if (avatarFileToUpload) {
            try {
                const formData = new FormData();
                formData.append("file", avatarFileToUpload);
                formData.append("userId", userId);

                const res = await fetch("/api/account/avatar", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    console.error("Avatar upload API error:", data);
                    setErrorMsg(
                        data?.error ??
                        "Erreur lors de l’upload de la photo de profil.",
                    );
                    return;
                }

                const publicUrl: string = data.publicUrl;
                const cacheBustedUrl = publicUrl.includes("?")
                    ? `${publicUrl}&t=${Date.now()}`
                    : `${publicUrl}?t=${Date.now()}`;

                setProfile((prev) =>
                    prev
                        ? {
                            ...prev,
                            avatar_url: cacheBustedUrl,
                        }
                        : prev,
                );

                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("elan:avatar-updated", {
                            detail: { avatarUrl: cacheBustedUrl },
                        }),
                    );
                }

                setCroppedAvatarBlob(null);
                if (avatarPreviewUrl) {
                    URL.revokeObjectURL(avatarPreviewUrl);
                    setAvatarPreviewUrl(null);
                }
            } catch (err) {
                console.error("Erreur upload avatar (client):", err);
                setErrorMsg("Erreur lors de l’upload de la photo de profil.");
                return;
            }
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
        <>
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
                            avatarUrl: avatarPreviewUrl ?? profile.avatar_url,
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
                        onSubmit={handleAccountSubmit}
                        onChangePasswordClick={() => setPasswordModalOpen(true)}
                        onAvatarFileSelected={handleAvatarFileSelected}
                        onDeleteAvatar={handleDeleteAvatar}
                    />
                </Card>

                <Card className="rounded-2xl border p-6">
                    <AccountSidebar
                        stats={stats}
                        ratingAvg={ratingAvg}
                        reviewsCount={reviewsCount}
                        reviews={reviews}
                    />
                </Card>
            </div>

            <AppModal
                variant="change-password"
                open={passwordModalOpen}
                onOpenChange={setPasswordModalOpen}
                onSubmit={async ({ currentPassword, newPassword }) => {
                    await changePassword(currentPassword, newPassword);
                }}
            />

            <AvatarCropperDialog
                open={avatarCropperOpen}
                onOpenChange={setAvatarCropperOpen}
                file={rawAvatarFile}
                onCropped={handleAvatarCropped}
            />
        </>
    );
}
