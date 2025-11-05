import Link from "next/link";
import { PageTitle } from "@/components/misc/page-title";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 text-center">
            <PageTitle title="Page introuvable" />
            <p className="text-sm text-muted-foreground">
                La page que vous recherchez n’existe pas ou a été déplacée.
            </p>
            <Button asChild>
                <Link href="/">Retour à l’accueil</Link>
            </Button>
        </div>
    );
}