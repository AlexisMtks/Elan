import { ProgressSteps } from "@/components/steps/progress-steps";

interface StepProgressProps {
    steps: { label: string; id?: string }[];
    currentStepIndex: number; // index de 0 à steps.length - 1
}

/**
 * Barre de progression pour les formulaires multi-étapes (création d’annonce) :
 * - pastilles numérotées pour chaque étape
 * - barre horizontale de progression en dessous
 */
export function StepProgress({ steps, currentStepIndex }: StepProgressProps) {
    const normalizedSteps = steps.map((step, index) => ({
        id: step.id ?? String(index),
        label: step.label,
    }));

    return (
        <div className="space-y-2">
            {/*/!* Ligne de pastilles (comme avant) *!/*/}
            {/*<ProgressSteps*/}
            {/*    steps={normalizedSteps}*/}
            {/*    currentIndex={currentStepIndex}*/}
            {/*    variant="pills"*/}
            {/*/>*/}

            {/* Barre de progression sous les pastilles */}
            <ProgressSteps
                steps={normalizedSteps}
                currentIndex={currentStepIndex}
                variant="bar"
            />
        </div>
    );
}