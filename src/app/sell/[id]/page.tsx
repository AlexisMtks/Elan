import { PageTitle } from "@/components/misc/page-title";
import { SellEditPageClient } from "@/components/sell/sell-edit-page-client";
import { BackToListingsButton } from "@/components/navigation/back-to-listings-button";

type SellEditPageParams = {
    id: string;
};

export default async function SellEditPage({
                                               params,
                                           }: {
    params: Promise<SellEditPageParams>;
}) {
    const {id} = await params;

    return (
        <div>
            <div>
                <BackToListingsButton/>
            </div>

            <div className="mb-2">
                <PageTitle
                    title="Créer une annonce"
                    // subtitle="Publiez facilement un article à vendre sur la plateforme."
                />
            </div>

            <SellEditPageClient listingId={id} />
        </div>
    );
}