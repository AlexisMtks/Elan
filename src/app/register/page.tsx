"use client";

import { PageTitle } from "@/components/misc/page-title";
import { RegisterForm } from "@/components/account/register-form";
import { useRedirectIfAuth } from "@/hooks/use-redirect-if-auth";

export default function RegisterPage() {
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
                title="Créer un compte"
                subtitle="Créez votre profil Élan pour publier des annonces et suivre vos commandes."
            />

            <RegisterForm />
        </div>
    );
}