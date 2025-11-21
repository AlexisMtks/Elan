// src/components/layout/header.tsx (ou équivalent)
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import Image from "next/image";

type HeaderVariant = "default" | "search" | "compact";

interface HeaderProps {
  variant?: HeaderVariant;
}

const getInitials = (name: string): string => {
  return name
      .split(" ")
      .filter((part: string) => part.trim().length > 0)
      .map((part: string) => part.trim()[0]!.toUpperCase())
      .slice(0, 2)
      .join("");
};

export function Header({ variant = "default" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarInitials, setAvatarInitials] = useState<string>("ME");

  const { theme, setMode } = useTheme();

  const showSearch =
      variant === "search" ||
      ["/", "/research", "/messages", "/account", "/profile"].some((p) =>
          pathname.startsWith(p),
      );

  // 🔁 petite aide pour récupérer l'URL actuelle (path + query)
  const getCurrentUrl = () => {
    if (typeof window === "undefined") {
      return pathname;
    }
    const search = window.location.search || "";
    return `${pathname}${search}`;
  };

  // Chargement du user + profil (avatar / initiales)
  const loadUserAndProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAuthenticated(false);
      setAvatarUrl(null);
      setAvatarInitials("ME");
      return;
    }

    setIsAuthenticated(true);

    const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, first_name, last_name")
        .eq("id", user.id)
        .single();

    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    } else {
      setAvatarUrl(null);
    }

    const baseName =
        profile?.display_name ||
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
        user.email ||
        "ME";

    const initials = getInitials(baseName);
    setAvatarInitials(initials || "ME");
  };

  // Déterminer si l’utilisateur est connecté + écouter les changements d’auth
  useEffect(() => {
    void loadUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadUserAndProfile();
      } else {
        setIsAuthenticated(false);
        setAvatarUrl(null);
        setAvatarInitials("ME");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Écouter les mises à jour d'avatar provenant de /account
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAvatarUpdated = (event: Event) => {
      const custom = event as CustomEvent<{ avatarUrl?: string }>;
      if (custom.detail?.avatarUrl) {
        setAvatarUrl(custom.detail.avatarUrl);
      }
    };

    window.addEventListener(
        "elan:avatar-updated",
        handleAvatarUpdated as EventListener,
    );

    return () => {
      window.removeEventListener(
          "elan:avatar-updated",
          handleAvatarUpdated as EventListener,
      );
    };
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

  const handleLogout = async () => {
    const currentUrl = getCurrentUrl();

    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAvatarUrl(null);
    setAvatarInitials("ME");

    // Pages protégées de ton app
    const protectedPaths = [
      "/account",
      "/messages",
      "/sales",
      "/purchases",
      "/publications",
    ];

    const isProtected = protectedPaths.some((p) =>
        currentUrl.startsWith(p),
    );

    if (isProtected) {
      // 🔐 Si on se déconnecte depuis une page protégée → on va sur /login
      // mais on garde en mémoire où retourner après re-login
      router.push(`/login?redirectTo=${encodeURIComponent(currentUrl)}`);
    } else {
      // 🌐 Sinon on reste sur la même page, mais déconnecté
      router.push(currentUrl);
    }
  };

  const handleToggleTheme = () => {
    setMode(theme.mode === "light" ? "dark" : "light");
  };

  // 🧭 URL de login incluant la page actuelle comme redirectTo
  const loginHref = `/login?redirectTo=${encodeURIComponent(getCurrentUrl())}`;

  return (
      <header className="border-b bg-background/80">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 md:gap-6 md:px-6 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* LOGO MOBILE */}
            <span className="md:hidden flex items-center">
            <Image
                src="/logos/logo-light.png"
                alt="Élan"
                width={200}
                height={150}
                className="dark:hidden h-8 w-auto -translate-y-[2px]"
                priority
            />
            <Image
                src="/logos/logo-dark.png"
                alt="Élan"
                width={200}
                height={150}
                className="hidden dark:block h-8 w-auto -translate-y-[2px]"
                priority
            />
          </span>

            {/* LOGO DESKTOP */}
            <span className="hidden md:flex items-center">
            <Image
                src="/logos/logo-light.png"
                alt="Élan"
                width={400}
                height={300}
                className="dark:hidden h-9 w-auto -translate-y-[2px]"
                priority
            />
            <Image
                src="/logos/logo-dark.png"
                alt="Élan"
                width={400}
                height={300}
                className="hidden dark:block h-9 w-auto -translate-y-[2px]"
                priority
            />
          </span>
          </Link>

          {/* Barre de recherche */}
          {showSearch && (
              <form className="flex-1" onSubmit={handleSearchSubmit}>
                <Input
                    placeholder="Rechercher…"
                    className="h-9 rounded-full translate-y-[1px] text-sm md:h-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </form>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/sell">
              <Button
                  size="sm"
                  className="whitespace-nowrap rounded-full px-4 text-sm font-semibold"
              >
                Vendre un article
              </Button>
            </Link>

            {/* Icône / menu compte */}
            {!isAuthenticated ? (
                // 🔑 Utilisateur non connecté : lien vers /login avec redirectTo
                <Link href={loginHref} aria-label="Mon compte">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="text-xs">ME</AvatarFallback>
                  </Avatar>
                </Link>
            ) : (
                // Utilisateur connecté : menu compte
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label="Menu compte"
                        className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <Avatar className="h-8 w-8 cursor-pointer">
                        {avatarUrl && (
                            <AvatarImage src={avatarUrl} alt="Photo de profil" />
                        )}
                        <AvatarFallback className="text-xs">
                          {avatarInitials}
                        </AvatarFallback>
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

                    {/* Switch thème */}
                    <DropdownMenuItem onClick={handleToggleTheme}>
                  <span className="mr-2 flex h-4 w-4 items-center justify-center">
                    {theme.mode === "light" ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                  </span>
                      {theme.mode === "light" ? "Mode sombre" : "Mode clair"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
          </div>
        </div>
      </header>
  );
}