"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type HeaderVariant = "default" | "search" | "compact";

interface HeaderProps {
    variant?: HeaderVariant;
}

export function Header({ variant = "default" }: HeaderProps) {
    const pathname = usePathname();

    const showSearch =
        variant === "search" ||
        ["/", "/research", "/messagerie", "/compte", "/profil"].some((p) =>
            pathname.startsWith(p),
        );

    return (
        <header className="border-b bg-background/80">
            <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-4">
                {/* Logo */}
                <Link href="/" className="font-serif text-2xl">
                    Élan
                </Link>

                {/* Barre de research */}
                {showSearch && (
                    <div className="flex-1">
                        <Input
                            placeholder="Rechercher…"
                            className="rounded-full"
                            // plus tard : on redirigera vers /research
                        />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button
                        variant="default"
                        onClick={() => alert("Simulation : vendre un article")}
                    >
                        Vendre un article
                    </Button>

                    {/* Icône / menu compte */}
                    <Link href="/compte" aria-label="Mon compte">
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarFallback className="text-xs">ME</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>
        </header>
    );
}