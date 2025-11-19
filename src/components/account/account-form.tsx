"use client";

import { FormEvent, useRef, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppIcon } from "@/components/misc/app-icon";

type Gender = "female" | "male" | "other" | "unspecified";

interface AccountFormValues {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  postcode: string;
  city: string;
  country: string;
  gender: Gender;
}

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
  onSubmit?: (values: AccountFormValues) => Promise<void> | void;
  onChangePasswordClick?: () => void;
  onAvatarFileSelected?: (file: File | null) => void;
  onDeleteAvatar?: () => void;
}

export function AccountForm({ profile, email, address, onSubmit, onChangePasswordClick, onAvatarFileSelected, onDeleteAvatar,}: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState<Gender>(
      (profile.gender as Gender) || "unspecified",
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onSubmit) {
      // Fallback si jamais onSubmit n'est pas fourni
      alert("Simulation : les informations du compte ont été enregistrées.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const values: AccountFormValues = {
      username: (formData.get("username") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      firstName: (formData.get("firstName") as string) ?? "",
      lastName: (formData.get("lastName") as string) ?? "",
      phone: (formData.get("phone") as string) ?? "",
      addressLine1: (formData.get("address") as string) ?? "",
      postcode: (formData.get("postcode") as string) ?? "",
      city: (formData.get("city") as string) ?? "",
      country: (formData.get("country") as string) ?? "",
      gender,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickAvatar = () => {
    fileInputRef.current?.click();
  };

// Toujours avoir un libellé de base pour générer des initiales
  const displayLabel =
      profile.displayName?.trim() ||
      email?.trim() ||
      "Elan utilisateur";

  const initials =
      displayLabel
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

  // const defaultGender: Gender =
  //     (profile.gender as Gender) || "unspecified";

  const rawAvatarUrl = profile.avatarUrl ?? undefined;

  const safeAvatarUrl =
      typeof rawAvatarUrl === "string" &&
      rawAvatarUrl.trim() !== "" &&
      !["null", "undefined"].includes(rawAvatarUrl.trim().toLowerCase())
          ? rawAvatarUrl.trim()
          : undefined;

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="relative h-16 w-16">
              {/* Avatar cliquable */}
              <button
                  type="button"
                  onClick={handleClickAvatar}
                  className="group h-16 w-16 rounded-full"
                  aria-label="Modifier la photo de profil"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={safeAvatarUrl} alt={displayLabel}/>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="pointer-events-none absolute inset-0 rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100"/>

                {isSubmitting && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full text-xs text-white"></span>
                )}
              </button>

              {/* Bouton supprimer avatar + popup de confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                      type="button"
                      className="
                            absolute
                            bottom-0
                            right-0
                            h-7
                            w-7
                            rounded-full
                            bg-background
                            shadow
                            flex
                            items-center
                            justify-center
                            border
                            border-border
                          "
                      aria-label="Supprimer la photo de profil"
                  >
                    <AppIcon name="trash" size={16}/>
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer la photo de profil ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action va supprimer définitivement votre photo de profil. Vous
                      pourrez en ajouter une nouvelle plus tard si vous le souhaitez.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {onDeleteAvatar?.();}}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Input fichier caché */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (onAvatarFileSelected) onAvatarFileSelected(file);
                }}
            />
          </div>
        </div>

          {/* Champs du formulaire */
          }
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
              <Input id="email" name="email" type="email" defaultValue={email}/>
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
              <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Sélectionner"/>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
          <Button
              type="button"
              variant="outline"
              onClick={
                  onChangePasswordClick ??
                  (() => alert("Simulation : changement de mot de passe."))
              }
          >
            Modifier le mot de passe
          </Button>
        </div>
      </form>
  );
}