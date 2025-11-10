// src/app/listings/new/page.tsx
import { PageTitle } from "@/components/misc/page-title";
import { SellForm } from "@/components/forms/sell-form";

export default function NewListingPage() {
    return (
        <div className="space-y-6">
            <PageTitle
                title="Créer une nouvelle annonce"
                subtitle="Images, détails, informations techniques et publication."
            />

            <SellForm />
        </div>
    );
}