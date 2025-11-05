interface DetailRowProps {
    label: string;
    value: string;
    /**
     * Layout de la ligne :
     * - "stacked" : label au-dessus de la valeur
     * - "inline"  : label à gauche, valeur à droite
     */
    layout?: "stacked" | "inline";
    /**
     * Taille du label.
     */
    size?: "sm" | "md";
    /**
     * Alignement de la valeur (utilisé en layout inline).
     */
    align?: "left" | "right";
    /**
     * Ajoute une bordure basse (pour les listes type tableau).
     */
    bordered?: boolean;
    /**
     * Autorise les retours à la ligne dans la valeur.
     */
    multiline?: boolean;
}

/**
 * Ligne générique label / valeur, réutilisable pour :
 * - détails techniques
 * - stats
 * - infos de commande
 */
export function DetailRow({
                              label,
                              value,
                              layout = "inline",
                              size = "md",
                              align = "left",
                              bordered = false,
                              multiline = false,
                          }: DetailRowProps) {
    const labelClass =
        size === "sm"
            ? "text-xs text-muted-foreground"
            : "text-sm text-muted-foreground";

    const baseValueClass = "text-sm font-medium";
    const alignClass = align === "right" ? "text-right" : "text-left";
    const multilineClass = multiline ? "whitespace-pre-line" : "";
    const borderClass = bordered ? "border-b pb-2 last:border-b-0" : "";

    if (layout === "stacked") {
        return (
            <div className="space-y-0.5">
                <dt className={labelClass}>{label}</dt>
                <dd className={`${baseValueClass} ${multilineClass}`}>{value}</dd>
            </div>
        );
    }

    return (
        <div
            className={`flex items-start justify-between gap-4 ${borderClass}`}
        >
            <dt className={labelClass}>{label}</dt>
            <dd
                className={`${baseValueClass} ${alignClass} ${multilineClass}`}
            >
                {value}
            </dd>
        </div>
    );
}