import { NextResponse } from "next/server";
import { resend } from "@/lib/resendClient";

export async function GET() {
    try {
        const { data, error } = await resend.emails.send({
            from: "Elan Dev <onboarding@resend.dev>", // expéditeur par défaut Resend pour les tests
            to: "TON_EMAIL_PERSO@exemple.com", // mets ton adresse mail ici
            subject: "Test Resend depuis Élan",
            html: `
        <h1>Test Resend ✅</h1>
        <p>Si tu vois cet email, la connexion entre Élan et Resend fonctionne.</p>
      `,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (e) {
        console.error("Unexpected error:", e);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}