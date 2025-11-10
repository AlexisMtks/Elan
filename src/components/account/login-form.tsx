"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Formulaire de connexion (simulation pour le MVP).
 * Plus tard : on branchera Supabase Auth ici.
 */
export function LoginForm() {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert("Simulation : connexion à votre compte.");
    };

    return (
        <Card className="mx-auto max-w-md rounded-2xl border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Connexion</h2>
                    <p className="text-sm text-muted-foreground">
                        Connectez-vous avec votre adresse e-mail et votre mot de passe.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="vous@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Button type="submit" className="w-full">
                        Se connecter
                    </Button>

                    <div className="text-center text-xs text-muted-foreground">
                        <span>Vous n’avez pas encore de compte ? </span>
                        <Button variant="link" size="sm" className="px-1" asChild>
                            <Link href="/register">Créer un compte</Link>
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}