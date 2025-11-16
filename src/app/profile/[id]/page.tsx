import { UserHeader } from "@/components/profile/user-header";
import { UserBio } from "@/components/profile/user-bio";
import { ProductCarousel } from "@/components/carousels/product-carousel";
import { ReviewsCarousel } from "@/components/carousels/reviews-carousel";
import { supabase } from "@/lib/supabaseClient";

interface ProfilePageProps {
    params: Promise<{ id: string }>;
}

type ProfileRow = {
    id: string;
    display_name: string;
    bio: string | null;
    city: string | null;
    country: string | null;
    listings_count: number | null;
    rating_avg: number | null;
    avatar_url: string | null;
};

type ListingRow = {
    id: number;
    title: string;
    price: number;
    city: string | null;
    status: string;
    seller_id: string;
};

type ReviewRow = {
    id: number;
    rating: number;
    comment: string | null;
    reviewer: { display_name: string }[] | null;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params;

    // Profil, annonces, avis en parallèle
    const [
        { data: profile, error: profileError },
        { data: listingsData },
        { data: reviewsData },
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select(
                "id, display_name, bio, city, country, listings_count, rating_avg, avatar_url"
            )
            .eq("id", id)
            .single(),
        supabase
            .from("listings")
            .select("id, title, price, city, status, seller_id")
            .eq("seller_id", id)
            .eq("status", "active")
            .order("created_at", { ascending: false }),
        supabase
            .from("reviews")
            .select(
                `
        id,
        rating,
        comment,
        reviewer:profiles!reviews_reviewer_id_fkey(display_name)
      `
            )
            .eq("reviewed_id", id)
            .order("created_at", { ascending: false }),
    ]);

    if (profileError || !profile) {
        return (
            <div className="space-y-4">
                <p className="text-lg font-semibold">Profil introuvable</p>
                <p className="text-sm text-muted-foreground">
                    Ce profil n’existe pas ou n’est pas accessible.
                </p>
            </div>
        );
    }

    const p = profile as ProfileRow;

    const location =
        p.city && p.country
            ? `${p.city}, ${p.country}`
            : p.city ?? p.country ?? "Localisation non renseignée";

    const user = {
        id: p.id,
        name: p.display_name,
        location,
        listingsCount: p.listings_count ?? 0,
        rating: Number(p.rating_avg ?? 0),
        bio:
            p.bio ??
            "Ce membre n’a pas encore rédigé de description de profil.",
        avatarUrl: p.avatar_url ?? null,
    };

    const listings = (listingsData ?? []) as ListingRow[];
    const reviews = (reviewsData ?? []) as ReviewRow[];

    const carouselItems = listings.map((l) => ({
        id: l.id.toString(),
        title: l.title,
        price: l.price / 100,
        location: l.city ?? undefined,
    }));

    const reviewItems = reviews.map((r) => ({
        id: r.id.toString(),
        author: r.reviewer?.[0]?.display_name ?? "Membre Élan",
        rating: r.rating ?? 0,
        content: r.comment ?? "",
    }));

    return (
        <div className="space-y-10">
            <UserHeader
                name={user.name}
                location={user.location}
                listingsCount={user.listingsCount}
                rating={user.rating}
                avatarUrl={user.avatarUrl}
            />

            <UserBio bio={user.bio} />

            <ProductCarousel title="Annonces actives" items={carouselItems} />

            <ReviewsCarousel title="Avis des acheteurs" reviews={reviewItems} />
        </div>
    );
}