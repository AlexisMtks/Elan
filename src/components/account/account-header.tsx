"use client";

import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/misc/page-title";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export function AccountHeader() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="flex items-center justify-between">
            <PageTitle
                title="Mon compte"
                subtitle="Gérez vos informations personnelles et accédez à votre activité."
            />

            <Button variant="destructive" type="button" onClick={handleLogout}>
                Se déconnecter
            </Button>
        </div>
    );
}