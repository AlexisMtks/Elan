import { PageTitle } from "@/components/misc/page-title";

export default function ContactPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="Contact"
                subtitle="Need help? Reach out to the Élan team."
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement simple contact form (simulated for the MVP).
            </p>
        </div>
    );
}