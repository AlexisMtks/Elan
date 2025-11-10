"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * Formulaire de création de compte connecté à Supabase Auth + profiles.
 */
export function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirm = formData.get("password_confirm") as string;

        if (password !== confirm) {
            setErrorMsg("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        // 1. Création du compte Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            console.error("Erreur signUp :", signUpError);
            setErrorMsg(signUpError.message || "Erreur lors de la création du compte.");
            setLoading(false);
            return;
        }

        const user = authData?.user ?? null;
        const session = authData?.session ?? null;

        if (!user) {
            setErrorMsg("Erreur lors de la création du compte (utilisateur introuvable).");
            setLoading(false);
            return;
        }

        // 2. Si aucune session (email de confirmation nécessaire), on informe l’utilisateur
        if (!session) {
            // Dans ce cas, la RLS empêchera de créer le profil côté client.
            setErrorMsg(
                "Votre compte a été créé. Veuillez vérifier vos e-mails pour confirmer votre adresse avant de compléter votre profil."
            );
            setLoading(false);
            return;
        }

        // 3. Création du profil lié (auth.uid() = user.id OK grâce à la session)
        const { error: profileError } = await supabase.from("profiles").insert({
            id: user.id,
            display_name: formData.get("display_name"),
            city: formData.get("city"),
            country: formData.get("country"),
            avatar_url: formData.get("avatar_url"),
            bio: formData.get("bio"),
            phone_number: formData.get("phone_number"),
            // les autres champs ont des valeurs par défaut dans le schéma
        });

        if (profileError) {
            console.error("Erreur profil :", {
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
                code: profileError.code,
            });
            setErrorMsg(
                "Votre compte a été créé, mais une erreur est survenue lors de la création du profil."
            );
            setLoading(false);
            return;
        }

        alert("Votre compte et votre profil ont été créés avec succès.");
        setLoading(false);
        router.push("/account");
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
                                Confirmation du mot de passe{" "}
                                <span className="text-red-500">*</span>
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

                {errorMsg && (
                    <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                )}

                <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Création en cours..." : "Créer mon compte"}
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