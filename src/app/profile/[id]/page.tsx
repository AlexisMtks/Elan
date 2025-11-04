import { PageTitle } from "@/components/misc/page-title";

interface ProfilePageProps {
    params: { id: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
    return (
        <div className="space-y-4">
            <PageTitle
                title="Public profile"
                subtitle={`Seller profile #${params.id}`}
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement public profile UI (avatar, bio, stats, listings, reviews).
            </p>
        </div>
    );
}