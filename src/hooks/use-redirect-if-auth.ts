"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface UseRedirectIfAuthOptions {
    redirectTo?: string;
}

/**
 * Hook inverse de useRequireAuth :
 * - si un user est connecté → redirige vers redirectTo (par défaut /account)
 * - sinon → laisse afficher la page (login / register)
 */
export function useRedirectIfAuth(options: UseRedirectIfAuthOptions = {}) {
    const { redirectTo = "/account" } = options;
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                router.replace(redirectTo);
                return;
            }

            setChecking(false);
        };

        checkAuth();
    }, [router, redirectTo]);

    return { user, checking };
}