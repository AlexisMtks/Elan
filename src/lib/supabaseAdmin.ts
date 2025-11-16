// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// On fait des checks runtime pour éviter un 500 silencieux
if (!supabaseUrl) {
    throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL n'est pas défini dans les variables d'environnement.",
    );
}

if (!serviceRoleKey) {
    throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY n'est pas défini dans les variables d'environnement (côté serveur).",
    );
}

// Client admin, à n'utiliser QUE côté serveur
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
    },
});