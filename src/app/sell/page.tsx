import { PageTitle } from "@/components/misc/page-title";
import { SellForm } from "@/components/forms/sell-form";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";

export default function SellPage() {
    return (
        <div className="space-y-10">
        <BackToAccountButton />
        <PageTitle
            title="Créer une annonce"
    subtitle="Publiez facilement un article à vendre sur la plateforme."
        />
        <SellForm />
        </div>
);
}