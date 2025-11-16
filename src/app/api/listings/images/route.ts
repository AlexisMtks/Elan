import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "Missing file" },
                { status: 400 },
            );
        }

        // 🔹 Génération d’un chemin unique
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `listing-${crypto.randomUUID()}.${ext}`;
        const path = `temp/${fileName}`; // on les met dans un dossier "temp" pour l’instant

        // 🔹 Upload dans le bucket "listing-images" avec le client admin (service_role)
        const { error: uploadError } = await supabaseAdmin.storage
            .from("listing-images")
            .upload(path, file, {
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            console.error("[API /listings/images] Upload error:", uploadError);
            return NextResponse.json(
                { error: uploadError.message ?? "Upload error" },
                { status: 400 },
            );
        }

        const { data } = supabaseAdmin
            .storage
            .from("listing-images")
            .getPublicUrl(path);

        const publicUrl = data.publicUrl;

        return NextResponse.json(
            { publicUrl, path },
            { status: 200 },
        );
    } catch (err: any) {
        console.error("[API /listings/images] Unexpected error:", err);
        return NextResponse.json(
            {
                error:
                    err?.message ??
                    "Unexpected error in /api/listings/images route handler",
            },
            { status: 500 },
        );
    }
}