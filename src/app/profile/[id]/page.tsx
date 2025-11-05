import { PageTitle } from "@/components/misc/page-title";
import { UserHeader } from "@/components/profile/user-header";
import { UserBio } from "@/components/profile/user-bio";
import { ProductCarousel } from "@/components/carousels/product-carousel";
import { ReviewsCarousel } from "@/components/carousels/reviews-carousel";

// MOCK data for MVP
const MOCK_USER = {
    id: "42",
    name: "Marie",
    location: "Paris",
    listingsCount: 4,
    rating: 4.7,
    bio: "Coach de gymnastique artistique depuis 10 ans. Passionnée par la transmission et la valorisation du matériel sportif durable.",
};

const MOCK_LISTINGS = [
    { id: "1", title: "Gym mat", price: 80, location: "Paris" },
    { id: "2", title: "Beam", price: 290, location: "Lyon" },
    { id: "3", title: "Rings", price: 110, location: "Toulouse" },
];

const MOCK_REVIEWS = [
    {
        id: "r1",
        author: "Pauline",
        rating: 5,
        content: "Produit conforme et en parfait état. Vendeuse très réactive.",
    },
    {
        id: "r2",
        author: "Lucas",
        rating: 4,
        content: "Bon contact et livraison rapide, je recommande.",
    },
    {
        id: "r3",
        author: "Sophie",
        rating: 5,
        content: "Matériel impeccable, communication fluide.",
    },
];

interface ProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params;
    const user = MOCK_USER; // plus tard: fetch by params.id

    return (
        <div className="space-y-10">
            <UserHeader
                name={user.name}
                location={user.location}
                listingsCount={user.listingsCount}
                rating={user.rating}
            />

            <UserBio bio={user.bio} />

            <ProductCarousel title="Annonces actives" items={MOCK_LISTINGS} />

            <ReviewsCarousel title="Avis des acheteurs" reviews={MOCK_REVIEWS} />
        </div>
    );
}
