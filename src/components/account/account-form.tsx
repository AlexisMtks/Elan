// src/components/account/account-form.tsx
"use client";

import { FormEvent } from "react";
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

interface AccountFormProps {
  profile: {
    displayName: string;
    city?: string | null;
    country?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    phoneNumber?: string | null;
  };
  email: string;
}

export function AccountForm({ profile, email }: AccountFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Simulation : les informations du compte ont été enregistrées.");
  };

  const handleChangeAvatar = () => {
    alert("Simulation : modification de la photo de profil.");
  };

  const [firstName, ...rest] = profile.displayName.split(" ");
  const lastName = rest.join(" ");
  const initials =
    profile.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "EL";

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
            onClick={handleChangeAvatar}
            className="group relative h-16 w-16 rounded-full"
            aria-label="Modifier la photo de profil"
          >
            <Avatar className="h-16 w-16">
              {/* Plus tard : AvatarImage avec profile.avatarUrl */}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            {/* Overlay sombre au survol */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* Champs du formulaire */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={firstName || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" name="lastName" defaultValue={lastName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile.phoneNumber ?? ""}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            placeholder="Votre adresse postale"
          />
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="gender">Genre</Label>
          <Select defaultValue="na">
            <SelectTrigger id="gender">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Femme</SelectItem>
              <SelectItem value="male">Homme</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
              <SelectItem value="na">Préférer ne pas répondre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">Enregistrer les modifications</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            alert("Simulation : changement de mot de passe.")
          }
        >
          Modifier le mot de passe
        </Button>
      </div>
    </form>
  );
}
