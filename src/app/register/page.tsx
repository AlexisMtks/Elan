import { PageTitle } from "@/components/misc/page-title";
import { RegisterForm } from "@/components/account/register-form";

export default function RegisterPage() {
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