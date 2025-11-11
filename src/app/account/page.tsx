// src/app/account/page.tsx
import { PageTitle } from "@/components/misc/page-title";
import { AccountPageClient } from "@/components/account/account-page-client";

export default function AccountPage() {
  return (
    <div className="space-y-10">
      <PageTitle
        title="Mon compte"
        subtitle="Gérez vos informations personnelles et accédez à votre activité."
      />

      {/* Toute la logique de récupération du user / profil / stats est dans ce composant client */}
      <AccountPageClient />
    </div>
  );
}
