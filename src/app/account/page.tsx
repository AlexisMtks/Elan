import { PageTitle } from "@/components/misc/page-title";
import { AccountForm } from "@/components/account/account-form";
import { AccountActivity } from "@/components/account/account-activity";

export default function AccountPage() {
    // Données mockées pour le MVP
    const stats = {
        listings: 4,
        sales: 12,
        purchases: 5,
    };

    return (
        <div className="space-y-10">
            <PageTitle
                title="Mon compte"
                subtitle="Gérez vos informations personnelles et accédez à votre activité."
            />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <AccountForm />
                <AccountActivity stats={stats} />
            </div>
        </div>
    );
}