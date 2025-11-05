import { ProgressSteps } from "@/components/steps/progress-steps";

interface OrderStatusBarProps {
    currentStatus: "placed" | "shipped" | "delivered";
}

const ORDER_STEPS = [
    { id: "placed", label: "Commande passée" },
    { id: "shipped", label: "Expédiée" },
    { id: "delivered", label: "Livrée" },
] as const;

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