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