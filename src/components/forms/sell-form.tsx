"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { SellSuccessDialog } from "./sell-success-dialog";
import { StepProgress } from "@/components/steps/step-progress";

type SellMode = "publish" | "draft" | null;

/**
 * Formulaire de création d’annonce multi-étapes :
 * 1. Informations principales
 * 2. Photos
 * 3. Résumé (placeholder MVP)
 */
export function SellForm() {
    const [openDialog, setOpenDialog] = useState(false);
    const [mode, setMode] = useState<SellMode>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { label: "Informations" },
        { label: "Photos" },
        { label: "Résumé" },
    ];

    const isLastStep = currentStep === steps.length - 1;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMode("publish");
        setOpenDialog(true);
    };

    const handleSaveDraft = () => {
        setMode("draft");
        setOpenDialog(true);
    };

    const goToPrevious = () => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
    };

    const goToNext = () => {
        setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    };

    return (
        <>
            <Card className="space-y-6 rounded-2xl border p-6">
                {/* Barre de progression */}
                <StepProgress steps={steps} currentStepIndex={currentStep} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Étape 1 : informations principales */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Titre */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre de l’annonce</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ex : Poutre d’équilibre 2m"
                                        required
                                    />
                                </div>

                                {/* Prix */}
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (€)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Ex : 150"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Catégorie */}
                                <div className="space-y-2">
                                    <Label>Catégorie</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisissez une catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="apparatus">Appareil</SelectItem>
                                            <SelectItem value="clothing">Tenue</SelectItem>
                                            <SelectItem value="accessory">Accessoire</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* État */}
                                <div className="space-y-2">
                                    <Label>État</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisissez un état" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Neuf</SelectItem>
                                            <SelectItem value="very_good">Très bon état</SelectItem>
                                            <SelectItem value="good">Bon état</SelectItem>
                                            <SelectItem value="used">Usagé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Décrivez votre article..."
                                    rows={5}
                                />
                            </div>
                        </div>
                    )}

                    {/* Étape 2 : photos */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Ajoutez des photos de votre article. Dans une version
                                ultérieure, vous pourrez réorganiser l’ordre des images et
                                définir une photo principale.
                            </p>
                            <ImageUpload />
                        </div>
                    )}

                    {/* Étape 3 : résumé (placeholder MVP) */}
                    {currentStep === 2 && (
                        <div className="space-y-3">
                            <h2 className="text-base font-semibold">
                                Résumé de votre annonce
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Dans une version future, un récapitulatif détaillé de votre
                                annonce (titre, prix, photos, informations techniques) sera
                                affiché ici avant publication. Pour le moment, cette étape
                                sert uniquement de confirmation avant l’enregistrement du
                                brouillon ou la publication.
                            </p>
                        </div>
                    )}

                    {/* Navigation des étapes / actions */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={goToPrevious}
                            disabled={currentStep === 0}
                        >
                            Étape précédente
                        </Button>

                        <div className="flex gap-3">
                            {!isLastStep ? (
                                <Button type="button" onClick={goToNext}>
                                    Étape suivante
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveDraft}
                                    >
                                        Enregistrer le brouillon
                                    </Button>
                                    <Button type="submit">Publier l’annonce</Button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </Card>

            <SellSuccessDialog
                open={openDialog}
                onOpenChange={setOpenDialog}
                mode={mode ?? "publish"}
            />
        </>
    );
}