import { PageTitle } from "@/components/misc/page-title";
import { LoginForm } from "@/components/account/login-form";

export default function LoginPage() {
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