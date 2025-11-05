/**
 * Formattage de montants en euros sans décimales.
 * Exemple : 2450 -> "2 450 €"
 */
export function formatCurrency(value: number): string {
    return `${value.toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })} €`;
}

/**
 * Formattage de montants en euros avec décimales.
 * Exemple : 87.5 -> "87,50 €"
 */
export function formatCurrencyWithCents(value: number): string {
    return `${value.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} €`;
}

/**
 * Formattage avec signe explicite pour les écarts de prix.
 * Exemple : -230 -> "-230 €", 150 -> "+150 €"
 */
export function formatSignedCurrency(value: number): string {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${formatted} €`;
}

/**
 * Formattage en pourcentage.
 * Exemple : -8 -> "-8%"
 */
export function formatPercent(value: number): string {
    return `${value.toLocaleString("fr-FR", {
        maximumFractionDigits: 0,
    })}%`;
}