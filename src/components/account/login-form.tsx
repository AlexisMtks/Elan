"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
    redirectTo?: string;
}

export function LoginForm({ redirectTo = "/account" }: LoginFormProps) {
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

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg("Identifiants invalides. Veuillez réessayer.");
            setLoading(false);
            return;
        }

        if (data?.user) {
            // ✅ On renvoie l'utilisateur là d'où il vient
            router.push(redirectTo);
            return;
        }

        setLoading(false);
    };

    const registerHref = redirectTo
        ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
        : "/register";

    return (
        <Card className="mx-auto max-w-md rounded-2xl border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Connexion</h2>
                    <p className="text-sm text-muted-foreground">
                        Connectez-vous à votre compte Élan.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <Input id="email" type="email" name="email" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input id="password" type="password" name="password" required />
                    </div>
                </div>

                {errorMsg && (
                    <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                )}

                <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </Button>

                    <div className="text-center text-xs text-muted-foreground">
                        <span>Pas encore de compte ? </span>
                        <Button variant="link" size="sm" className="px-1" asChild>
                            <Link href={registerHref}>Créer un compte</Link>
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}