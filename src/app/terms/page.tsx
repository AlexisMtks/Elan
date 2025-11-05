import { PageTitle } from "@/components/misc/page-title";

export default function TermsPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="Conditions d’utilisation"
                subtitle="Consultez les conditions générales de la plateforme Élan."
            />
            <p className="text-sm text-muted-foreground">
                À faire : ajouter les mentions légales et les conditions générales d’utilisation.
            </p>
        </div>
    );
}