"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

/**
 * Récupère l'utilisateur courant sans redirection.
 * - checking = true pendant la phase de chargement
 * - user = null si non connecté
 */
export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            setChecking(true);
            try {
                const { data, error } = await supabase.auth.getUser();

                if (error) {
                    if (!cancelled) {
                        setUser(null);
                    }
                    return;
                }

                if (!cancelled) {
                    setUser(data.user ?? null);
                }
            } finally {
                if (!cancelled) {
                    setChecking(false);
                }
            }
        };

        loadUser();

        const { data: subscription } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (cancelled) return;
                setUser(session?.user ?? null);
            },
        );

        return () => {
            cancelled = true;
            subscription?.subscription.unsubscribe();
        };
    }, []);

    return { user, checking };
}