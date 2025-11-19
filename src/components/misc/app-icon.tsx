"use client";

import Image from "next/image";
import type { HTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { Trash2 } from "lucide-react";

type ImgDef = {
    type: "img";
    src: string;        // chemin dans /public
    alt?: string;
};

type LucideDef = {
    type: "lucide";
    icon: LucideIcon;
};

type IconDef = ImgDef | LucideDef;

// 🗂️ Registre de toutes tes icônes
const ICONS = {
    // Icône poubelle custom (celle que tu as déjà dans /public/icons/ic-trash.png)
    trash: {
        type: "img",
        src: "/icons/ic-trash.png",
        alt: "Supprimer",
    } satisfies ImgDef,

    // Variante Lucide si un jour tu veux un stroke
    trashOutline: {
        type: "lucide",
        icon: Trash2,
    } satisfies LucideDef,

    // Exemple pour plus tard (logo, etc.)
    // logo: {
    //   type: "img",
    //   src: "/logos/elan-light.svg",
    //   alt: "Élan",
    // } satisfies ImgDef,
} as const;

export type AppIconName = keyof typeof ICONS;

interface AppIconProps
    extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
    name: AppIconName;
    size?: number; // en px
}

/**
 * Icône applicative centralisée
 *
 * - `name` doit être une clé présente dans ICONS
 * - supporte les icônes Lucide et les assets du dossier /public
 */
export function AppIcon({
                            name,
                            size = 16,
                            className,
                            ...rest
                        }: AppIconProps) {
    const def = ICONS[name];

    const mergedClassName = [
        "inline-flex items-center justify-center",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    // Fallback si jamais l'icône n'est pas définie (dev only)
    if (!def) {
        return (
            <span
                aria-hidden
                className={mergedClassName}
                style={{ width: size, height: size }}
                {...rest}
            >
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
      </span>
        );
    }

    if (def.type === "lucide") {
        const LucideIcon = def.icon;
        return (
            <span className={mergedClassName} {...rest}>
        <LucideIcon size={size} />
      </span>
        );
    }

    // type === "img"
    return (
        <span
            className={mergedClassName}
            style={{ width: size, height: size }}
            {...rest}
        >
      <Image
          src={def.src}
          alt={def.alt ?? name}
          width={size}
          height={size}
          className="object-contain"
      />
    </span>
    );
}