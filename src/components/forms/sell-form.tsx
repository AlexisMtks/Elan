"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabaseClient";

type SellMode = "publish" | "draft" | null;

type Category = {
    id: number;
    name: string;
    slug: string;
};

export function SellForm() {
    const [openDialog, setOpenDialog] = useState(false);
    const [mode, setMode] = useState<SellMode>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
        undefined,
    );
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Champs du formulaire (contrôlés)
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [condition, setCondition] = useState<string | null>(null);

    // Images
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    // Gestion état / erreurs
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const steps = [
        { label: "Informations" },
        { label: "Photos" },
        { label: "Résumé" },
    ];

    const isLastStep = currentStep === steps.length - 1;

    // 🔹 Charger les catégories au montage
    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from("categories")
                .select("id, name, slug")
                .order("name", { ascending: true });

            if (error) {
                console.error("Erreur lors du chargement des catégories :", error);
            } else {
                setCategories(data ?? []);
            }
            setLoadingCategories(false);
        }

        fetchCategories();
    }, []);

    const createListing = async (status: "draft" | "active") => {
        setErrorMsg(null);
        setSubmitting(true);

        try {
            // 1) Utilisateur connecté
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error("Erreur récupération utilisateur :", userError);
                setErrorMsg("Vous devez être connecté pour créer une annonce.");
                return;
            }

            // 2) Validation des champs principaux
            const trimmedTitle = title.trim();
            const trimmedDescription = description.trim();
            const priceEuros = Number(price);
            const priceCents =
                Number.isFinite(priceEuros) && priceEuros >= 0
                    ? Math.round(priceEuros * 100)
                    : NaN;

            if (!trimmedTitle || !trimmedDescription || !Number.isFinite(priceCents)) {
                setErrorMsg(
                    "Merci de renseigner au minimum le titre, la description et un prix valide.",
                );
                return;
            }

            const categoryId = selectedCategory ? Number(selectedCategory) : null;

            // 3) Insertion de l'annonce
            const { data: listing, error: insertError } = await supabase
                .from("listings")
                .insert({
                    seller_id: user.id,
                    title: trimmedTitle,
                    description: trimmedDescription,
                    price: priceCents,
                    currency: "EUR",
                    status, // "draft" ou "active"
                    category_id: categoryId,
                    brand: null,
                    condition: condition, // "new" | "very_good" | "good" | "used" | null
                    size: null,
                    city: null,
                    country: null,
                    shipping_time: null,
                    is_negotiable: false,
                })
                .select("id")
                .single();

            if (insertError || !listing) {
                console.error("Erreur insertion listing :", insertError);
                setErrorMsg("Erreur lors de la création de l’annonce.");
                return;
            }

            // 4) Insertion des images associées
            if (imageUrls.length > 0) {
                const rows = imageUrls.map((url, index) => ({
                    listing_id: listing.id,
                    image_url: url,
                    position: index + 1,
                }));

                const { error: imagesError } = await supabase
                    .from("listing_images")
                    .insert(rows);

                if (imagesError) {
                    console.error("Erreur insertion listing_images :", imagesError);
                    // On n'arrête pas tout, l’annonce est déjà créée
                }
            }

            // 5) Succès : on ouvre la modale + reset du formulaire
            setMode(status === "draft" ? "draft" : "publish");
            setOpenDialog(true);

            setTitle("");
            setPrice("");
            setDescription("");
            setSelectedCategory(undefined);
            setCondition(null);
            setImageUrls([]);
            setCurrentStep(0);
        } catch (err) {
            console.error("Erreur inattendue lors de la création d’annonce :", err);
            setErrorMsg("Erreur inattendue lors de la création de l’annonce.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isLastStep) {
            setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
            return;
        }

        await createListing("active");
    };

    const handleSaveDraft = async () => {
        await createListing("draft");
    };

    const goToPrevious = () =>
        setCurrentStep((prev) => Math.max(0, prev - 1));
    const goToNext = () =>
        setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));

    return (
        <>
            <Card className="space-y-6 rounded-2xl border p-6">
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
                                        name="title"
                                        placeholder="Ex : Poutre d’équilibre 2m"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                {/* Prix */}
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (€)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        placeholder="Ex : 150"
                                        min="0"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>

                                {/* Catégorie (liée à la BDD) */}
                                <div className="space-y-2">
                                    <Label>Catégorie</Label>
                                    {loadingCategories ? (
                                        <p className="text-sm text-muted-foreground">
                                            Chargement des catégories...
                                        </p>
                                    ) : categories.length > 0 ? (
                                        <Select
                                            value={selectedCategory}
                                            onValueChange={setSelectedCategory}
                                        >
                                            <SelectTrigger className="min-w-[200px] w-full">
                                                <SelectValue placeholder="Choisissez une catégorie" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map((cat) => (
                                                        <SelectItem
                                                            key={cat.id}
                                                            value={cat.id.toString()}
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Aucune catégorie disponible.
                                        </p>
                                    )}
                                </div>

                                {/* État */}
                                <div className="space-y-2">
                                    <Label>État</Label>
                                    <Select
                                        value={condition ?? undefined}
                                        onValueChange={(v) => setCondition(v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisissez un état" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Neuf</SelectItem>
                                            <SelectItem value="very_good">
                                                Très bon état
                                            </SelectItem>
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
                                    name="description"
                                    placeholder="Décrivez votre article..."
                                    rows={5}
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Étape 2 : photos */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Ajoutez des photos de votre article.
                            </p>
                            <ImageUpload onChange={setImageUrls} />
                        </div>
                    )}

                    {/* Étape 3 : résumé (placeholder) */}
                    {currentStep === 2 && (
                        <div className="space-y-3">
                            <h2 className="text-base font-semibold">
                                Résumé de votre annonce
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Dans une version future, un récapitulatif détaillé sera
                                affiché ici.
                            </p>
                        </div>
                    )}

                    {/* Message d'erreur */}
                    {errorMsg && (
                        <p className="text-sm text-red-500">{errorMsg}</p>
                    )}

                    {/* Navigation des étapes */}
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
                                        disabled={submitting}
                                    >
                                        {submitting && mode === "draft"
                                            ? "Enregistrement..."
                                            : "Enregistrer le brouillon"}
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && mode === "publish"
                                            ? "Publication..."
                                            : "Publier l’annonce"}
                                    </Button>
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
