interface StepProgressProps {
    steps: { label: string }[];
    currentStepIndex: number; // index de 0 à steps.length - 1
}

/**
 * Barre de progression générique pour afficher des étapes (création d’annonce,
 * suivi de commande, etc.).
 */
export function StepProgress({ steps, currentStepIndex }: StepProgressProps) {
    return (
        <ol className="flex flex-wrap items-center gap-4 rounded-2xl bg-muted/40 px-4 py-3 text-xs sm:text-sm">
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;

                return (
                    <li key={`${step.label}-${index}`} className="flex items-center gap-2">
                        <div
                            className={[
                                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium",
                                isCompleted
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : isActive
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-muted-foreground/30 bg-background text-muted-foreground",
                            ].join(" ")}
                        >
                            {index + 1}
                        </div>
                        <span
                            className={[
                                "whitespace-nowrap",
                                isCompleted || isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                            ].join(" ")}
                        >
              {step.label}
            </span>
                    </li>
                );
            })}
        </ol>
    );
}