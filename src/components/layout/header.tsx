"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type HeaderVariant = "default" | "search" | "compact";

interface HeaderProps {
    variant?: HeaderVariant;
}

export function Header({ variant = "default" }: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [search, setSearch] = useState("");

    const showSearch =
        variant === "search" ||
        ["/", "/research", "/messagerie", "/compte", "/profil"].some((p) =>
            pathname.startsWith(p),
        );

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = search.trim();

        if (query) {
            router.push(`/research?q=${encodeURIComponent(query)}`);
        } else {
            router.push("/research");
        }
    };

    return (
        <header className="border-b bg-background/80">
            <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-4">
                {/* Logo */}
                <Link href="/" className="font-serif text-2xl">
                    Élan
                </Link>

                {/* Barre de recherche */}
                {showSearch && (
                    <form className="flex-1" onSubmit={handleSearchSubmit}>
                        <Input
                            placeholder="Rechercher…"
                            className="rounded-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                )}

                <div className="flex items-center gap-3">
                    <Link href="/sell">
                        <Button>Vendre un article</Button>
                    </Link>

                    {/* Icône / menu compte */}
                    <Link href="/account" aria-label="Mon compte">
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarFallback className="text-xs">ME</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>
        </header>
    );
}