import { PageTitle } from "@/components/misc/page-title";
import { ProductGallery } from "@/components/listing/product-gallery";
import { TechnicalDetails } from "@/components/listing/technical-details";
import { ProductCarousel } from "@/components/carousels/product-carousel";
import { ListingActions } from "@/components/listing/listing-actions";

interface ListingDetailPageProps {
    params: Promise<{ id: string }>;
}

// MOCK data for MVP
const MOCK_LISTING = {
    title: "Cheval d’arçons",
    price: 350,
    location: "Paris",
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    images: ["/placeholder-1", "/placeholder-2", "/placeholder-3"],
    category: "Apparatus",
    brand: "-",
    size: "Standard",
    condition: "Good condition",
    seller: {
        id: "42", // 👈 ajoute un ID (ou n’importe quelle string)
        name: "Marie",
        listingsCount: 4,
    },
};

const MOCK_RELATED = [
    { id: "1", title: "Gym mat", price: 80, location: "Paris" },
    { id: "2", title: "Gym mat 2m", price: 120, location: "Lyon" },
    { id: "3", title: "Beam", price: 290, location: "Marseille" },
    { id: "4", title: "Rings", price: 110, location: "Toulouse" },
];

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
    const { id } = await params; // ✅ nouvelle syntaxe Next.js 16
    const listing = MOCK_LISTING; // plus tard: fetch by id

    return (
        <div className="space-y-10">
            {/* Top: gallery + summary */}
            <section className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div>
                    <ProductGallery images={listing.images} />
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <PageTitle title={listing.title} />
                        <p className="text-2xl font-semibold">{listing.price} €</p>

                        {/* Boutons dans un composant client */}
                        <ListingActions />

                        <p className="text-sm text-muted-foreground">
                            {listing.location}
                        </p>
                    </div>

                    <TechnicalDetails
                        seller={listing.seller}
                        category={listing.category}
                        brand={listing.brand}
                        size={listing.size}
                        condition={listing.condition}
                        location={listing.location}
                    />
                </div>
            </section>

            {/* Description */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {listing.description}
                </p>
            </section>

            {/* Carousel */}
            <ProductCarousel title="Vous pourriez aussi aimer" items={MOCK_RELATED} />
        </div>
    );
}
