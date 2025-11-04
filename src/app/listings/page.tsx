import { PageTitle } from "@/components/misc/page-title";

export default function MyListingsPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="My listings"
                subtitle="Manage your active listings and drafts."
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement listings dashboard (stats, pie chart, active listings,
                drafts).
            </p>
        </div>
    );
}