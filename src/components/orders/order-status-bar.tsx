interface OrderStatusBarProps {
    currentStatus: "placed" | "shipped" | "delivered";
}

/**
 * Barre de progression horizontale pour l'état de la commande
 * (Commande passée / Expédiée / Livrée).
 */
export function OrderStatusBar({ currentStatus }: OrderStatusBarProps) {
    const steps = [
        { id: "placed", label: "Commande passée" },
        { id: "shipped", label: "Expédiée" },
        { id: "delivered", label: "Livrée" },
    ] as const;

    const currentIndex = steps.findIndex((step) => step.id === currentStatus);
    const progressPercent =
        currentIndex <= 0
            ? 0
            : (currentIndex / (steps.length - 1)) * 100;

    return (
        <div className="space-y-2">
            {/* Ligne de progression */}
            <div className="relative h-1 rounded-full bg-muted">
                <div
                    className="absolute left-0 top-0 h-1 rounded-full bg-foreground"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
                {steps.map((step, index) => {
                    const isActive = index === currentIndex;
                    const isPassed = index < currentIndex;

                    return (
                        <span
                            key={step.id}
                            className={
                                isActive || isPassed
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                            }
                        >
              {step.label}
            </span>
                    );
                })}
            </div>
        </div>
    );
}