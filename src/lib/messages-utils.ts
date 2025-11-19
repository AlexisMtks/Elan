// src/lib/messages-utils.ts
import type { Conversation } from "@/types/messages";

// Normalise une relation Supabase (objet ou tableau) en un seul objet
export function normalizeRelation<T = any>(rel: any): T | null {
    if (!rel) return null;
    if (Array.isArray(rel)) return rel[0] ?? null;
    return rel;
}

export function normalizeText(value: string): string {
    if (!value) return "";
    return value
        .normalize("NFD") // décompose les accents
        .replace(/[\u0300-\u036f]/g, "") // supprime les diacritiques
        .toLowerCase();
}

// extrait un montant avec symbole de monnaie, ex: "50 €", "12.5$", "12,5€"
export function extractPriceRaw(query: string): string | null {
    const match = query.match(/(\d+(?:[.,]\d+)?)[\s]*([€$£])/);
    if (!match) return null;
    return match[1].replace(",", ".");
}

export function formatConversationTimestamp(
    input: string | Date | null | undefined,
): string {
    if (!input) return "";

    const date = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(date.getTime())) return "";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    // JJ/MM/AAAA HH:MM
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Applique exactement la même logique de recherche / scoring
 * que ce que tu avais dans handleSearch.
 */
export function searchConversations(
    conversations: Conversation[],
    rawQuery: string,
): Conversation[] {
    const raw = rawQuery.trim();
    if (!raw) return [];

    const normalizedQuery = normalizeText(raw);
    const priceToken = extractPriceRaw(raw);
    const queryPrice = priceToken !== null ? parseFloat(priceToken) : null;

    const resultsWithScore = conversations
        .map((conv) => {
            const normalizedName = normalizeText(conv.contactName);
            const normalizedTitle = normalizeText(conv.productTitle);
            const normalizedMessages = normalizeText(conv.messagesSearchText ?? "");

            let score = 0;

            // 🔹 1) Montant exact (50€, 12.5$, etc.)
            if (queryPrice !== null && conv.listingPrice !== null) {
                const convPrice = conv.listingPrice / 100; // centimes -> €
                if (Math.abs(convPrice - queryPrice) < 0.01) {
                    score += 400;
                }
            }

            // 🔹 2) nom d’utilisateur
            if (normalizedName.includes(normalizedQuery)) {
                score += 200;
            }

            // 🔹 3) titre de l’annonce
            if (normalizedTitle.includes(normalizedQuery)) {
                score += 100;
            }

            // 🔹 4) contenu des messages
            if (normalizedMessages.includes(normalizedQuery)) {
                score += 50;
            }

            return { conv, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.conv);

    return resultsWithScore;
}