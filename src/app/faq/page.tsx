import { PageTitle } from "@/components/misc/page-title";

export default function FaqPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="FAQ"
                subtitle="Questions fréquentes sur la plateforme Élan."
            />
            <p className="text-sm text-muted-foreground">
                À faire : ajouter les questions fréquentes et leurs réponses.
            </p>
        </div>
    );
}