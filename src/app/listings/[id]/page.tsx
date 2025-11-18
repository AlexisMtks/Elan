import { ProductGallery } from "@/components/listing/product-gallery";
import { TechnicalDetails } from "@/components/listing/technical-details";
import { ProductCarousel } from "@/components/carousels/product-carousel";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

interface ListingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
    // ✅ Next 16 : params est une Promise
    const { id } = await params;
    const listingId = id;

    // --- Récupération de l'annonce + images + vendeur ---
    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select(
            `
        id,
        title,
        description,
        price,
        currency,
        status,
        category_id,
        brand,
        condition,
        size,
        city,
        country,
        shipping_time,
        is_negotiable,
        seller:profiles!listings_seller_id_fkey (
          id,
          display_name,
          listings_count,
          avatar_url
        ),
        listing_images ( image_url )
      `
        )
        .eq("id", listingId)
        .single();

    if (listingError || !listing) {
        return (
            <div className="space-y-4">
                <p className="text-lg font-semibold">Annonce introuvable</p>
                <p className="text-sm text-muted-foreground">
                    Cette annonce n’existe pas ou a été supprimée.
                </p>
            </div>
        );
    }

    const images =
        listing.listing_images?.map((img: any) => img.image_url) ?? [];

    const location =
        listing.city && listing.country
            ? `${listing.city}, ${listing.country}`
            : listing.city ?? listing.country ?? "Localisation non précisée";

    const rawSeller = listing.seller;
    const sellerRow = Array.isArray(rawSeller) ? rawSeller[0] : rawSeller;

    // On calcule le nombre d'annonces actives pour ce vendeur
    let activeListingsCount = 0;
    if (sellerRow?.id) {
        const { count } = await supabase
            .from("listings")
            .select("id", { count: "exact", head: true })
            .eq("seller_id", sellerRow.id)
            .eq("status", "active");

        activeListingsCount = count ?? 0;
    }

    const seller = {
        id: sellerRow?.id ?? "",
        name: sellerRow?.display_name ?? "Vendeur",
        listingsCount: activeListingsCount,
        avatarUrl: sellerRow?.avatar_url ?? null,
    };

    // 2. Annonces similaires (même catégorie, autres id)
    const { data: relatedListings } = await supabase
        .from("listings")
        .select("id, title, price, city")
        .eq("category_id", listing.category_id)
        .neq("id", listing.id)
        .eq("status", "active")
        .limit(4);

    const related = relatedListings?.map((l) => ({
        id: l.id.toString(),
        title: l.title,
        price: l.price / 100,
        location: l.city ?? undefined,
    }));

    return (
        <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-3 lg:py-0">
            {/* Top: galerie + détails */}
            <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] xl:gap-12">
                {/* Colonne image */}
                <div className="flex justify-center lg:justify-start">
                    <div className="w-full max-w-[720px]">
                        <ProductGallery images={images} />
                    </div>
                </div>

                {/* Colonne droite */}
                <div className="w-full lg:ml-auto lg:max-w-md xl:max-w-lg">
                    <TechnicalDetails
                        seller={seller}
                        title={listing.title}
                        price={listing.price / 100}
                        category={listing.category_id?.toString() ?? "-"}
                        brand={listing.brand ?? "-"}
                        size={listing.size ?? "-"}
                        condition={listing.condition ?? "-"}
                        location={location}
                    />
                </div>
            </section>

            {/* Description */}
            <section>
                <Card className="rounded-2xl border p-5">
                    <h2 className="text-lg font-semibold">Description</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {listing.description ??
                            "Aucune description n’a été fournie pour cette annonce."}
                    </p>
                </Card>
            </section>

            {/* Produits similaires */}
            {related && related.length > 0 && (
                <ProductCarousel title="Vous pourriez aussi aimer" items={related} />
            )}
        </div>
    );
}