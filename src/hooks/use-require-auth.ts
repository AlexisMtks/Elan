"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface UseRequireAuthOptions {
  redirectTo?: string;
}

/**
 * Hook de protection des pages :
 * - vérifie s'il y a un utilisateur connecté via Supabase
 * - si non → redirige vers /login (ou autre route)
 * - retourne { user, checking }
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = "/login" } = options;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(redirectTo);
        return;
      }

      setUser(user);
      setChecking(false);
    };

    checkAuth();
  }, [router, redirectTo]);

  return { user, checking };
}
