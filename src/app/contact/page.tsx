import { PageTitle } from "@/components/misc/page-title";

export default function ContactPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="Contact"
                subtitle="Besoin d’aide ? Contactez l’équipe Élan."
            />
            <p className="text-sm text-muted-foreground">
                À faire : ajouter un formulaire de contact simple (action simulée pour le MVP).
            </p>
        </div>
    );
}