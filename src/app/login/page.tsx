"use client";

import { PageTitle } from "@/components/misc/page-title";
import { LoginForm } from "@/components/account/login-form";
import { useRedirectIfAuth } from "@/hooks/use-redirect-if-auth";

export default function LoginPage() {
    const { checking } = useRedirectIfAuth();

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

            <LoginForm />
        </div>
    );
}