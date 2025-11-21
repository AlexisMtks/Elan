"use client";

import { PageTitle } from "@/components/misc/page-title";
import { LoginForm } from "@/components/account/login-form";
import { useRedirectIfAuth } from "@/hooks/use-redirect-if-auth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const searchParams = useSearchParams();

    // Peut venir de /login?redirectTo=/quelque-chose
    const redirectToParam = searchParams.get("redirectTo");
    const redirectTo = redirectToParam ?? undefined;

    // Le hook attend un objet
    const { checking } = useRedirectIfAuth({ redirectTo });

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

            <LoginForm redirectTo={redirectTo} />
        </div>
    );
}