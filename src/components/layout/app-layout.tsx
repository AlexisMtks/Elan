import * as React from "react";
import { Header } from "./header";
import { Footer } from "./footer";

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header variant="default" />
            <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-6 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}