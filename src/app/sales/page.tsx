import { PageTitle } from "@/components/misc/page-title";

export default function SalesPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="My sales"
                subtitle="Track your earnings and completed sales."
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement sales dashboard (metrics, chart, sales history list).
            </p>
        </div>
    );
}