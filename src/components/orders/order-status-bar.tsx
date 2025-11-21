import { ProgressSteps } from "@/components/steps/progress-steps";

export type OrderStatusStepId =
    | "placed"
    | "processing"
    | "shipped"
    | "delivered";

interface OrderStatusBarProps {
    currentStatus: OrderStatusStepId;
}

const ORDER_STEPS: { id: OrderStatusStepId; label: string }[] = [
    { id: "placed",      label: "Commande passée" },
    { id: "processing",  label: "Préparation" },
    { id: "shipped",     label: "Expédiée" },
    { id: "delivered",   label: "Livrée" },
];

/**
 * Barre de progression pour l’état global d’une commande,
 * basée sur ProgressSteps (variant "bar").
 */
export function OrderStatusBar({ currentStatus }: OrderStatusBarProps) {
    return (
        <ProgressSteps
            steps={ORDER_STEPS}
            currentStepId={currentStatus}
            variant="bar"
        />
    );
}