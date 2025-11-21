"use client";

import { PageTitle } from "@/components/misc/page-title";
import { LoginForm } from "@/components/account/login-form";
import { useRedirectIfAuth } from "@/hooks/use-redirect-if-auth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    // On récupère le paramètre redirectTo si présent
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";

    // On passe redirectTo au hook
    // Pour que si l'utilisateur est déjà connecté, il soit renvoyé sur cette page
    const { checking } = useRedirectIfAuth(redirectTo);

    if (checking) {
        return (
            <p className="text-sm text-muted-foreground">
                Vérification de votre session...
            </p>
        );
    }

    return (
        <div className="space-y-8">
            <PageTitle
                title="Connexion"
                subtitle="Accédez à votre compte Élan pour gérer vos annonces, vos ventes et vos achats."
            />

            {/* 🔥 On transmet redirectTo au formulaire */}
            <LoginForm redirectTo={redirectTo} />
        </div>
    );
}