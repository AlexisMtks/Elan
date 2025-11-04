import { PageTitle } from "@/components/misc/page-title";

interface ListingDetailPageProps {
    params: { id: string };
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
    return (
        <div className="space-y-4">
            <PageTitle title="Listing detail" />
            <p className="text-sm text-muted-foreground">
                TODO: implement listing detail UI for listing #{params.id}
                (images, price, seller card, technical sheet, description, “You may also like”…).
            </p>
        </div>
    );
}