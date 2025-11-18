import { supabase } from "@/lib/supabaseClient";

export async function changePassword(
    currentPassword: string,
    newPassword: string
) {
    // 1) Récupérer l'utilisateur courant
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw userError;
    }

    if (!user?.email) {
        throw new Error("Utilisateur introuvable.");
    }

    // 2) Vérifier l'ancien mot de passe via un sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (signInError) {
        throw new Error("L'ancien mot de passe est incorrect.");
    }

    // 3) Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (updateError) {
        throw updateError;
    }
}