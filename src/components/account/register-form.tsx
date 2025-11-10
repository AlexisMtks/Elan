"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * Formulaire de création de compte complet (version étendue).
 * Reflète les principaux champs de la table public.profiles.
 */
export function RegisterForm() {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const password = formData.get("password");
        const confirm = formData.get("password_confirm");

        if (password !== confirm) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }

        alert("Simulation : création de votre compte avec profil complet.");
    };

    return (
        <Card className="mx-auto max-w-2xl rounded-2xl border p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section : Informations de base */}
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">Informations personnelles</h2>
                        <p className="text-sm text-muted-foreground">
                            Ces informations apparaîtront sur votre profil public.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="display_name">
                                Nom d’affichage <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="display_name"
                                name="display_name"
                                placeholder="Nom visible sur vos annonces"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar_url">Photo de profil (URL)</Label>
                            <Input
                                id="avatar_url"
                                name="avatar_url"
                                type="url"
                                placeholder="https://exemple.com/avatar.jpg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="first_name">
                                Prénom <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                placeholder="Jean"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last_name">
                                Nom <span className="text-red-500">*</span>
                            </Label>
                            <Input id="last_name" name="last_name" placeholder="Dupont" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">
                                Ville <span className="text-red-500">*</span>
                            </Label>
                            <Input id="city" name="city" placeholder="Paris" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">
                                Pays <span className="text-red-500">*</span>
                            </Label>
                            <Input id="country" name="country" placeholder="France" required />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">
                                Adresse postale <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="12 rue des Fleurs, 75000 Paris"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio">Présentation</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Décrivez brièvement votre profil ou votre activité..."
                            />
                        </div>
                    </div>
                </section>

                {/* Section : Contact et sécurité */}
                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">Contact et sécurité</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Téléphone</Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                placeholder="+33 6 ..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Adresse e-mail <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="vous@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Mot de passe <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirm">
                                Confirmation du mot de passe <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password_confirm"
                                name="password_confirm"
                                type="password"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Boutons */}
                <div className="space-y-3">
                    <Button type="submit" className="w-full">
                        Créer mon compte
                    </Button>

                    <div className="text-center text-xs text-muted-foreground">
                        <span>Vous avez déjà un compte ? </span>
                        <Button variant="link" size="sm" className="px-1" asChild>
                            <Link href="/login">Se connecter</Link>
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}