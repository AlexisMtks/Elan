"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type HeaderVariant = "default" | "search" | "compact";

interface HeaderProps {
  variant?: HeaderVariant;
}

export function Header({ variant = "default" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const showSearch =
    variant === "search" ||
    ["/", "/research", "/messages", "/account", "/profile"].some((p) =>
      pathname.startsWith(p),
    );

  // Déterminer si l’utilisateur est connecté
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsAuthenticated(!!user);
    }

    checkAuth();
  }, []);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();

    if (query) {
      router.push(`/research?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/research");
    }
  };

  const handleGoToAccount = () => {
    router.push("/account");
  };

  const handleGoToMessages = () => {
    router.push("/messages");
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
          {!isAuthenticated ? (
            // Utilisateur non connecté : lien direct vers la page de connexion
            <Link href="/login" aria-label="Mon compte">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="text-xs">ME</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            // Utilisateur connecté : menu burger / dropdown sur l’avatar
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu compte"
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="text-xs">ME</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGoToAccount}>
                  Mon compte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGoToMessages}>
                  Mes messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
