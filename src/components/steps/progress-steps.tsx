interface ProgressStep {
    id: string;
    label: string;
}

type ProgressVariant = "pills" | "bar";

interface ProgressStepsProps {
    steps: ProgressStep[];
    /**
     * Index actuel (0-based). Optionnel si currentStepId est fourni.
     */
    currentIndex?: number;
    /**
     * ID de l’étape actuelle. Optionnel si currentIndex est fourni.
     */
    currentStepId?: string;
    /**
     * Variante d’affichage :
     * - "pills" : utilisée pour le formulaire multi-étapes
     * - "bar"   : utilisée pour le suivi de commande
     */
    variant?: ProgressVariant;
}

/**
 * Composant générique de progression dans une liste d’étapes.
 * Utilisé comme base pour :
 * - StepProgress (création d’annonce)
 * - OrderStatusBar (détail commande)
 */
export function ProgressSteps({
                                  steps,
                                  currentIndex,
                                  currentStepId,
                                  variant = "pills",
                              }: ProgressStepsProps) {
    // Calcul de l’index courant
    let resolvedIndex = 0;

    if (typeof currentIndex === "number") {
        resolvedIndex = Math.min(Math.max(currentIndex, 0), steps.length - 1);
    } else if (currentStepId) {
        const foundIndex = steps.findIndex((step) => step.id === currentStepId);
        resolvedIndex = foundIndex >= 0 ? foundIndex : 0;
    }

    if (variant === "bar") {
        return (
            <BarSteps steps={steps} currentIndex={resolvedIndex} />
        );
    }

    return (
        <PillSteps steps={steps} currentIndex={resolvedIndex} />
    );
}

function PillSteps({
                       steps,
                       currentIndex,
                   }: {
    steps: ProgressStep[];
    currentIndex: number;
}) {
    return (
        <ol className="flex flex-wrap items-center gap-4 rounded-2xl bg-muted/40 px-4 py-3 text-xs sm:text-sm">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;

                return (
                    <li key={step.id} className="flex items-center gap-2">
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

function BarSteps({
                      steps,
                      currentIndex,
                  }: {
    steps: ProgressStep[];
    currentIndex: number;
}) {
    const progressPercent =
        steps.length <= 1
            ? 0
            : (currentIndex / (steps.length - 1)) * 100;

    return (
        <div className="space-y-2">
            {/* Barre horizontale */}
            <div className="relative h-1 rounded-full bg-muted">
                <div
                    className="absolute left-0 top-0 h-1 rounded-full bg-foreground"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Labels des étapes */}
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