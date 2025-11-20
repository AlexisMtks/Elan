"use client";

import React, { FormEvent, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

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
  bio: string;
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

export function AccountForm({
                              profile,
                              email,
                              address,
                              onSubmit,
                              onChangePasswordClick,
                              onAvatarFileSelected,
                              onDeleteAvatar,
                            }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState<Gender>(
      (profile.gender as Gender) || "unspecified",
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onSubmit) {
      alert("Simulation : les informations du compte ont été enregistrées.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const values: AccountFormValues = {
      username: (formData.get("username") as string) ?? "",
      // email est bloqué en lecture seule → on renvoie la valeur de la prop
      email,
      firstName: (formData.get("firstName") as string) ?? "",
      lastName: (formData.get("lastName") as string) ?? "",
      phone: (formData.get("phone") as string) ?? "",
      addressLine1: (formData.get("address") as string) ?? "",
      postcode: (formData.get("postcode") as string) ?? "",
      city: (formData.get("city") as string) ?? "",
      country: (formData.get("country") as string) ?? "",
      gender,
      bio: (formData.get("bio") as string) ?? "",
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

  const handleNewAvatarFile = (file: File | null) => {
    if (onAvatarFileSelected) {
      onAvatarFileSelected(file);
    }
  };

  const handleAvatarInputChange = (
      event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    handleNewAvatarFile(file);
  };

  const handleAvatarDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsAvatarDragOver(true);
  };

  const handleAvatarDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsAvatarDragOver(false);
  };

  const handleAvatarDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsAvatarDragOver(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;

    handleNewAvatarFile(file);
  };

  const displayLabel =
      profile.displayName?.trim() || email?.trim() || "Elan utilisateur";

  const initials = displayLabel
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

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

          {/* Avatar cliquable avec drag & drop */}
          <div className="flex flex-col items-center gap-2 md:items-end">
            <div className="relative h-16 w-16">
              <button
                  type="button"
                  onClick={handleClickAvatar}
                  onDragOver={handleAvatarDragOver}
                  onDragLeave={handleAvatarDragLeave}
                  onDrop={handleAvatarDrop}
                  className={`group h-16 w-16 rounded-full transition ${
                      isAvatarDragOver ? "ring-2 ring-primary/60 ring-offset-2" : ""
                  }`}
                  aria-label="Modifier la photo de profil (clic ou glisser-déposer une image)"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={safeAvatarUrl} alt={displayLabel}/>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div
                    className="pointer-events-none absolute inset-0 rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100"/>

                {isSubmitting && (
                    <span
                        className="absolute inset-0 flex items-center justify-center rounded-full text-xs text-white"/>
                )}
              </button>

              {/* Bouton supprimer avatar */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                      type="button"
                      className="
                    absolute
                    bottom-0
                    right-0
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-background
                    shadow
                  "
                      aria-label="Supprimer la photo de profil"
                  >
                    <AppIcon name="trash" size={16}/>
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Supprimer la photo de profil ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action va supprimer définitivement votre photo de
                      profil. Vous pourrez en ajouter une nouvelle plus tard si
                      vous le souhaitez.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                          onDeleteAvatar?.();
                        }}
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarInputChange}
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

          {/* Email (non modifiable pour l’instant) */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
                id="email"
                name="email"
                type="email"
                defaultValue={email}
                readOnly
                className="bg-muted/40 cursor-not-allowed"
            />
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
            <Select
                value={gender}
                onValueChange={(value) => setGender(value as Gender)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Sélectionner"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Femme</SelectItem>
                <SelectItem value="male">Homme</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
                <SelectItem value="unspecified">
                  Préférer ne pas répondre
                </SelectItem>
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

          {/* Bio / description */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Description</Label>
            <Textarea
                id="bio"
                name="bio"
                placeholder="Parlez un peu de vous, de votre expérience en gymnastique, de ce que vous vendez..."
                defaultValue={profile.bio ?? ""}
                className="min-h-[96px] text-sm"
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
