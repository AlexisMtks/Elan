import { PageTitle } from "@/components/misc/page-title";
import { SellEditPageClient } from "@/components/sell/sell-edit-page-client";

type SellEditPageParams = {
    id: string;
};

export default async function SellEditPage({
                                               params,
                                           }: {
    params: Promise<SellEditPageParams>;
}) {
    // 🔹 Avec Next 16, params est une Promise -> on l'await
    const { id } = await params;

    return (
        <div className="space-y-10">
            <PageTitle
                title="Modifier mon annonce"
                subtitle="Mettez à jour les informations de votre annonce."
            />

            <SellEditPageClient listingId={id} />
        </div>
    );
}