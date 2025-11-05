import { PageTitle } from "@/components/misc/page-title";

export default function NewListingPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="Créer une nouvelle annonce"
                subtitle="Images, détails, informations techniques et publication."
            />
            <p className="text-sm text-muted-foreground">
                À faire : implémenter le formulaire de création d’annonce multi-étapes (étapes 1–2–3).
            </p>
        </div>
    );
}