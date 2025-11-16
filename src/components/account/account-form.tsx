"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

type Gender = "female" | "male" | "other" | "unspecified";

interface AccountFormProps {
  profile: {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName: string;
    city?: string | null;
    country?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    phoneNumber?: string | null;
    gender?: Gender | null;
  };
  email: string;
  address?: {
    line1?: string | null;
    postcode?: string | null;
    city?: string | null;
    country?: string | null;
  };
  onAvatarChange?: (file: File) => Promise<void> | void;
}

export function AccountForm({ profile, email, address, onAvatarChange }: AccountFormProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
      profile.avatarUrl ?? null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: patch profils + adresse (Supabase) — ici on reste en simulation
    alert("Simulation : les informations du compte ont été enregistrées.");
  };

  // ❌ on supprime l’ancien handleChangeAvatar() qui faisait juste un alert
  // const handleChangeAvatar = () => {
  //   alert("Simulation : modification de la photo de profil.");
  // };

  const handleClickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (
      event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview immédiate côté client
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    if (!onAvatarChange) return;

    try {
      setIsUploadingAvatar(true);
      await onAvatarChange(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const initials =
      (profile.displayName || "")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "EL";

  const defaultGender: Gender =
      (profile.gender as Gender) || "unspecified";

  const currentAvatarUrl = avatarPreview ?? profile.avatarUrl ?? undefined;

  return (
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border p-6">
        {/* En-tête + avatar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Informations personnelles</h2>
            <p className="text-sm text-muted-foreground">
              Mettez à jour vos informations de profil.
            </p>
          </div>

          {/* Avatar cliquable avec hover sombre */}
          <div className="flex flex-col items-center gap-2 md:items-end">
            <button
                type="button"
                onClick={handleClickAvatar}
                className="group relative h-16 w-16 rounded-full"
                aria-label="Modifier la photo de profil"
            >
              <Avatar className="h-16 w-16">
                {currentAvatarUrl ? (
                    <AvatarImage src={currentAvatarUrl} alt={profile.displayName} />
                ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>

              <div className="pointer-events-none absolute inset-0 rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100" />

              {isUploadingAvatar && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full text-xs text-white">
        …
      </span>
              )}
            </button>

            {/* Input fichier caché */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
            />
          </div>
        </div>

        {/* Champs du formulaire */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Nom d’utilisateur</Label>
            <Input
                id="username"
                name="username"
                placeholder="ex. marie_lem"
                defaultValue={profile.username ?? ""}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" defaultValue={email} />
          </div>

          {/* Prénom */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
                id="firstName"
                name="firstName"
                defaultValue={profile.firstName ?? ""}
            />
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
                id="lastName"
                name="lastName"
                defaultValue={profile.lastName ?? ""}
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
                id="phone"
                name="phone"
                defaultValue={profile.phoneNumber ?? ""}
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="gender">Genre</Label>
            <Select defaultValue={defaultGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Femme</SelectItem>
                <SelectItem value="male">Homme</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
                <SelectItem value="unspecified">Préférer ne pas répondre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Adresse – Ligne 1 */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
                id="address"
                name="address"
                placeholder="12 rue des Fleurs"
                defaultValue={address?.line1 ?? ""}
            />
          </div>

          {/* Code postal */}
          <div className="space-y-2">
            <Label htmlFor="postcode">Code postal</Label>
            <Input
                id="postcode"
                name="postcode"
                placeholder="75000"
                defaultValue={address?.postcode ?? ""}
            />
          </div>

          {/* Ville */}
          <div className="place-self-stretch space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
                id="city"
                name="city"
                placeholder="Paris"
                defaultValue={address?.city ?? profile.city ?? ""}
            />
          </div>

          {/* Pays */}
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
                id="country"
                name="country"
                placeholder="France"
                defaultValue={address?.country ?? profile.country ?? ""}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Enregistrer les modifications</Button>
          <Button
              type="button"
              variant="outline"
              onClick={() => alert("Simulation : changement de mot de passe.")}
          >
            Modifier le mot de passe
          </Button>
        </div>
      </form>
  );
}