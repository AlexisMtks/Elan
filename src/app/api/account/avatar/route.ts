// src/app/api/account/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file = formData.get("file");
        const userId = formData.get("userId");

        if (!(file instanceof File) || typeof userId !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid file/userId" },
                { status: 400 },
            );
        }

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `avatar-${crypto.randomUUID()}.${ext}`;
        const path = `${userId}/${fileName}`;

        // 1) Upload dans le bucket avatars avec le client admin
        const { error: uploadError } = await supabaseAdmin.storage
            .from("avatars")
            .upload(path, file, {
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            console.error("[API /account/avatar] Upload error:", uploadError);
            return NextResponse.json(
                { error: uploadError.message ?? "Upload error" },
                { status: 400 },
            );
        }

        const { data: publicUrlData } = supabaseAdmin.storage
            .from("avatars")
            .getPublicUrl(path);

        const publicUrl = publicUrlData.publicUrl;

        // 2) Mise à jour du profil
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", userId);

        if (updateError) {
            console.error("[API /account/avatar] Profile update error:", updateError);
            return NextResponse.json(
                {
                    error:
                        updateError.message ??
                        "Erreur lors de la mise à jour du profil en base",
                },
                { status: 400 },
            );
        }

        return NextResponse.json({ publicUrl }, { status: 200 });
    } catch (err: any) {
        console.error("[API /account/avatar] Unexpected error:", err);
        return NextResponse.json(
            {
                error:
                    err?.message ??
                    "Unexpected error in /api/account/avatar route handler",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || typeof userId !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid userId" },
                { status: 400 },
            );
        }

        // 1) Récupérer l'URL actuelle de l'avatar
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("avatar_url")
            .eq("id", userId)
            .single();

        if (profileError) {
            console.error(
                "[API /account/avatar] Profile fetch error (DELETE):",
                profileError,
            );
            return NextResponse.json(
                { error: "Impossible de récupérer le profil" },
                { status: 500 },
            );
        }

        const avatarUrl = (profile?.avatar_url as string | null) ?? null;

        // 2) Si on a une URL, tenter de supprimer le fichier du bucket avatars
        if (avatarUrl) {
            try {
                const url = new URL(avatarUrl);
                // Exemple de path: /storage/v1/object/public/avatars/userId/avatar-xxx.jpg
                const pathname = url.pathname; // "/storage/v1/object/public/avatars/...."
                const marker = "/avatars/";

                const idx = pathname.indexOf(marker);
                if (idx !== -1) {
                    const path = pathname.slice(idx + marker.length); // "userId/avatar-xxx.jpg"

                    if (path) {
                        const { error: storageError } = await supabaseAdmin.storage
                            .from("avatars")
                            .remove([path]);

                        if (storageError) {
                            console.error(
                                "[API /account/avatar] Storage delete error:",
                                storageError,
                            );
                            // on log, mais on continue pour mettre avatar_url à null
                        }
                    }
                }
            } catch (parseErr) {
                console.error(
                    "[API /account/avatar] Error parsing avatar URL:",
                    parseErr,
                );
                // on continue quand même
            }
        }

        // 3) Mettre avatar_url à null dans profiles
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ avatar_url: null })
            .eq("id", userId);

        if (updateError) {
            console.error(
                "[API /account/avatar] Profile update error (DELETE):",
                updateError,
            );
            return NextResponse.json(
                { error: "Impossible de mettre à jour le profil" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: any) {
        console.error("[API /account/avatar] Unexpected error (DELETE):", err);
        return NextResponse.json(
            {
                error:
                    err?.message ??
                    "Unexpected error in /api/account/avatar DELETE handler",
            },
            { status: 500 },
        );
    }
}