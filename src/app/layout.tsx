import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
    title: "Élan",
    description: "Plateforme d’achat et revente de matériel de gymnastique",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
        <body className="min-h-screen bg-background text-foreground">
        <AppLayout>{children}</AppLayout>
        </body>
        </html>
    );
}