import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { FloatingActions } from "@/components/navigation/floating-actions";

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
      <html
          lang="fr"
          data-style="terracotta"
          data-theme="light"
          className="h-full"
      >
      <body className="min-h-screen bg-background text-foreground">
      <ThemeProvider>
        {/* Layout principal avec Header + Footer */}
        <AppLayout>{children}</AppLayout>

        {/* 🔹 Boutons flottants en bas à droite */}
        <FloatingActions />
      </ThemeProvider>
      </body>
      </html>
  );
}