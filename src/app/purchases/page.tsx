import { PageTitle } from "@/components/misc/page-title";

export default function PurchasesPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="My purchases"
                subtitle="Overview of your orders and spending on Élan."
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement purchases dashboard (stats cards, chart, purchase history list).
            </p>
        </div>
    );
}