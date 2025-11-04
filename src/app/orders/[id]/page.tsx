import { PageTitle } from "@/components/misc/page-title";
import { StepProgress } from "@/components/steps/step-progress";
import { Card } from "@/components/ui/card";

interface OrderDetailPageProps {
    params: { id: string };
}

// Étapes mockées pour le suivi de commande
const ORDER_STEPS = [
    { label: "Commande passée" },
    { label: "Préparation" },
    { label: "Expédition" },
    { label: "Livraison" },
];

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    // Pour le MVP, on fixe une étape courante simulée (ex : en préparation)
    const currentStepIndex = 1;

    return (
        <div className="space-y-8">
            <PageTitle
                title="Détail de la commande"
                subtitle={`Commande #${params.id}`}
            />

            <StepProgress steps={ORDER_STEPS} currentStepIndex={currentStepIndex} />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl border p-4">
                    <p className="text-sm font-semibold">Résumé de la commande</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Section de récapitulatif de la commande (article, prix, quantité,
                        moyen de paiement, etc.).
                    </p>
                </Card>

                <Card className="rounded-2xl border p-4">
                    <p className="text-sm font-semibold">Informations de livraison</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Section pour l’adresse de livraison, le mode de livraison et le
                        suivi du colis.
                    </p>
                </Card>
            </div>
        </div>
    );
}
