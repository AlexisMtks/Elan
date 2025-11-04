import { PageTitle } from "@/components/misc/page-title";

export default function AccountPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="My account"
                subtitle="Manage your personal information and activity."
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement account profile form and activity summary
                (sales, listings, purchases).
            </p>
        </div>
    );
}