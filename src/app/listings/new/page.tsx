import { PageTitle } from "@/components/misc/page-title";

export default function NewListingPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="Create a new listing"
                subtitle="Images, details, technical information and publication."
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement multi-step listing creation form (stepper 1–2–3).
            </p>
        </div>
    );
}