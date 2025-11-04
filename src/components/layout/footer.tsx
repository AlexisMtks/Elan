import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8">
                {/* Pourquoi Élan ? */}
                <div className="flex flex-wrap gap-8">
                    <FooterPillar
                        title="Durabilité"
                        text="Favorisez la seconde main"
                    />
                    <FooterPillar
                        title="Sécurité"
                        text="Achats et ventes en toute sécurité"
                    />
                    <FooterPillar
                        title="Communauté"
                        text="Pour les passionnés de gymnastique"
                    />
                </div>

                {/* Liens bas */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex gap-4">
                        <Link href="/faq">FAQ</Link>
                        <Link href="/terms">Conditions d’utilisation</Link>
                        <Link href="/contact">Contact</Link>
                    </div>
                    <span>© {new Date().getFullYear()} Élan</span>
                </div>
            </div>
        </footer>
    );
}

function FooterPillar({ title, text }: { title: string; text: string }) {
    return (
        <div className="flex min-w-[160px] flex-col">
            <span className="font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">{text}</span>
        </div>
    );
}