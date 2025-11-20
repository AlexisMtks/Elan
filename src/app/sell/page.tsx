import { PageTitle } from "@/components/misc/page-title";
import { SellForm } from "@/components/forms/sell-form";
import { BackToListingsButton } from "@/components/navigation/back-to-listings-button";

export default function SellPage() {
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

            <SellForm/>
        </div>
    );
}