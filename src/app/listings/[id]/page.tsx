import { PageTitle } from "@/components/misc/page-title";
import { ProductGallery } from "@/components/listing/product-gallery";
import { TechnicalDetails } from "@/components/listing/technical-details";
import { ProductCarousel } from "@/components/carousels/product-carousel";
import { ListingActions } from "@/components/listing/listing-actions";
import { supabase } from "@/lib/supabaseClient";

interface ListingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
    // ✅ Next 16 : params est une Promise
    const { id } = await params;
    const listingId = id;

    // 1. Récupération de l’annonce + vendeur + images
    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select(
            `
      id,
      title,
      description,
      price,
      city,
      country,
      category_id,
      brand,
      size,
      condition,
      seller_id,
      status,
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
        listing.listing_images?.map((img: any) => img.image_url) ??
        ["/placeholder-1"];

    const location =
        listing.city && listing.country
            ? `${listing.city}, ${listing.country}`
            : listing.city ?? listing.country ?? "Localisation non précisée";

    const rawSeller = listing.seller as any;

    const sellerRow = Array.isArray(rawSeller) ? rawSeller[0] : rawSeller;

    const seller = {
        id: sellerRow?.id?.toString() ?? "",
        name: sellerRow?.display_name ?? "Vendeur inconnu",
        listingsCount: sellerRow?.listings_count ?? 0,
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
        <div className="space-y-10">
            {/* Top: galerie + résumé */}
            <section className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div>
                    <ProductGallery images={images} />
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <PageTitle title={listing.title} />
                        <p className="text-2xl font-semibold">{listing.price / 100} €</p>

                        {/* Boutons client */}
                        <ListingActions />

                        <p className="text-sm text-muted-foreground">{location}</p>
                    </div>

                    <TechnicalDetails
                        seller={seller}
                        category={listing.category_id?.toString() ?? "-"}
                        brand={listing.brand ?? "-"}
                        size={listing.size ?? "-"}
                        condition={listing.condition ?? "-"}
                        location={location}
                    />
                </div>
            </section>

            {/* Description */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {listing.description ??
                        "Aucune description n’a été fournie pour cette annonce."}
                </p>
            </section>

            {/* Produits similaires */}
            {related && related.length > 0 && (
                <ProductCarousel title="Vous pourriez aussi aimer" items={related} />
            )}
        </div>
    );
}