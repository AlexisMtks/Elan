"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AvatarCropperDialog } from "@/components/avatar/avatar-cropper-dialog";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gender, setGender] = useState<string | undefined>(undefined);

  // 🔹 États pour le recadrage d’avatar
  const [rawAvatarFile, setRawAvatarFile] = useState<File | null>(null);
  const [croppedAvatarBlob, setCroppedAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarCropperOpen, setAvatarCropperOpen] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Nettoyage de l’URL de prévisualisation à l’unmount
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleClickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleNewAvatarFile = (file: File | null) => {
    if (!file) {
      setRawAvatarFile(null);
      setCroppedAvatarBlob(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
      return;
    }

    setRawAvatarFile(file);
    setAvatarCropperOpen(true);
  };

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleNewAvatarFile(file);
  };

  // Quand le recadrage est validé dans le modal
  const handleAvatarCropped = (blob: Blob) => {
    setCroppedAvatarBlob(blob);

    // Met à jour l’aperçu local
    const url = URL.createObjectURL(blob);
    setAvatarPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return url;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string) ?? "";
    const confirm = (formData.get("password_confirm") as string) ?? "";

    if (password !== confirm) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    // Champs profil
    const username = ((formData.get("username") as string) || "").trim();
    const first_name = ((formData.get("first_name") as string) || "").trim();
    const last_name = ((formData.get("last_name") as string) || "").trim();
    let avatarUrl: string | null = null;
    const city = ((formData.get("city") as string) || "").trim();
    const country = ((formData.get("country") as string) || "").trim();
    const address_line1 = ((formData.get("address") as string) || "").trim();
    const postcode = ((formData.get("postcode") as string) || "").trim();
    const bio = ((formData.get("bio") as string) || "").trim() || null;
    const phone_number =
        ((formData.get("phone_number") as string) || "").trim() || null;

    const display_name =
        username ||
        [first_name, last_name].filter(Boolean).join(" ").trim() ||
        email;

    // 1️⃣ Création du compte Auth avec métadonnées
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name,
          username,
          first_name,
          last_name,
          gender: gender ?? null,
          city,
          country,
          bio,
          phone_number,
          address_line1,
          postcode,
        },
      },
    });

    if (signUpError) {
      console.error("Erreur signUp :", signUpError);
      setErrorMsg(signUpError.message || "Erreur lors de la création du compte.");
      setLoading(false);
      return;
    }

    const user = authData?.user ?? null;
    const session = authData?.session ?? null;

    if (!user) {
      setErrorMsg("Utilisateur non retourné après la création du compte.");
      setLoading(false);
      return;
    }

    // 2️⃣ Upload avatar recadré si présent
    // On transforme le Blob recadré en File
    const avatarFileToUpload = croppedAvatarBlob
        ? new File([croppedAvatarBlob], "avatar.jpg", { type: "image/jpeg" })
        : null;

    if (avatarFileToUpload) {
      try {
        const fd = new FormData();
        fd.append("file", avatarFileToUpload);
        fd.append("userId", user.id);

        const resAvatar = await fetch("/api/account/avatar", {
          method: "POST",
          body: fd,
        });

        if (resAvatar.ok) {
          const avatarData = (await resAvatar.json()) as { publicUrl: string };
          avatarUrl = avatarData.publicUrl;
        } else {
          console.error("Erreur API avatar pendant l'inscription");
        }
      } catch (e) {
        console.error("Erreur inattendue lors de l'upload avatar:", e);
      }
    }

    // 3️⃣ Si confirmation email requise (pas de session ouverte)
    if (!session) {
      alert("Compte créé ! Vérifiez vos e-mails pour confirmer votre adresse.");
      setLoading(false);
      router.push("/login");
      return;
    }

    // 4️⃣ Création / mise à jour du profil
    const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name,
          username,
          first_name,
          last_name,
          gender,
          city,
          country,
          bio,
          phone_number,
          profile_visibility: "public",
          profile_type: "public",
          // On ne met pas avatar_url ici, il est géré côté API / triggers si besoin
        },
        { onConflict: "id" },
    );

    if (profileError) {
      console.error("Erreur profil :", profileError);
      setErrorMsg("Compte créé, mais erreur lors de la création du profil.");
      setLoading(false);
      return;
    }

    // 5️⃣ Insertion adresse (liée au profil)
    const { error: addressError } = await supabase.from("addresses").insert({
      user_id: user.id,
      line1: address_line1,
      city,
      country,
      postcode,
    });

    if (addressError) {
      console.error("Erreur adresse :", addressError);
      // pas bloquant
    }

    alert("Votre compte a été créé avec succès !");
    setLoading(false);
    router.push("/account");
  };

  const handleAvatarDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleAvatarDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleAvatarDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    handleNewAvatarFile(file);
  };

  return (
      <>
        <Card className="mx-auto max-w-2xl rounded-2xl border p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section : Informations personnelles */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Informations personnelles</h2>
                <p className="text-sm text-muted-foreground">
                  Ces informations apparaîtront sur votre profil public.
                </p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label>Photo de profil</Label>
                  <p className="text-xs text-muted-foreground">
                    Optionnel, vous pourrez la modifier plus tard dans votre compte.
                    Vous pouvez aussi glisser-déposer une image directement sur l’avatar.
                  </p>
                </div>

                <button
                    type="button"
                    onClick={handleClickAvatar}
                    onDragOver={handleAvatarDragOver}
                    onDragLeave={handleAvatarDragLeave}
                    onDrop={handleAvatarDrop}
                    className={`relative rounded-full border bg-muted/50 p-1 transition ${
                        isDragOver ? "ring-2 ring-primary/60 border-primary/60" : ""
                    }`}
                >
                  <Avatar className="h-16 w-16">
                    {avatarPreviewUrl ? (
                        <AvatarImage src={avatarPreviewUrl} alt="Aperçu avatar"/>
                    ) : (
                        <AvatarFallback>É</AvatarFallback>
                    )}
                  </Avatar>
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Nom d’utilisateur <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="username"
                      name="username"
                      placeholder="ex. marie_lem"
                      required
                  />
                </div>

                {/* Prénom */}
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input id="first_name" name="first_name" required/>
                </div>

                {/* Nom */}
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input id="last_name" name="last_name" required/>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select onValueChange={(v) => setGender(v)}>
                    <SelectTrigger id="gender" className="h-10">
                      <SelectValue placeholder="Sélectionner un genre (optionnel)"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                      <SelectItem value="unspecified">
                        Préfère ne pas dire
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ville */}
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" placeholder="ex. Lyon"/>
                </div>

                {/* Pays */}
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" name="country" placeholder="ex. France"/>
                </div>

                {/* Code postal */}
                <div className="space-y-2">
                  <Label htmlFor="postcode">Code postal</Label>
                  <Input id="postcode" name="postcode" placeholder="ex. 69001"/>
                </div>

                {/* Adresse */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                      id="address"
                      name="address"
                      placeholder="ex. 12 rue des Gymnastes"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Présentation</Label>
                  <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Décrivez brièvement votre profil ou votre activité..."
                  />
                </div>
              </div>
            </section>

            {/* Section contact */}
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Connexion & contact</h2>
                <p className="text-sm text-muted-foreground">
                  Ces informations seront utilisées pour sécuriser votre compte et
                  vous contacter si besoin.
                </p>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Adresse e-mail <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="vous@example.com"
                      required
                  />
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Téléphone (optionnel)</Label>
                  <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      placeholder="ex. 06 12 34 56 78"
                  />
                </div>

                {/* Mot de passe */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Mot de passe <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">
                      Confirmation du mot de passe{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="password_confirm"
                        name="password_confirm"
                        type="password"
                        required
                        minLength={6}
                    />
                  </div>
                </div>
              </div>
            </section>

            {errorMsg && (
                <p className="text-center text-sm text-red-500">{errorMsg}</p>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création en cours..." : "Créer mon compte"}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                <span>Vous avez déjà un compte ? </span>
                <Button variant="link" size="sm" className="px-1" asChild>
                  <Link href="/login">Se connecter</Link>
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* 🔹 Modal de recadrage d’avatar */}
        <AvatarCropperDialog
            open={avatarCropperOpen}
            onOpenChange={setAvatarCropperOpen}
            file={rawAvatarFile}
            onCropped={handleAvatarCropped}
        />
      </>
  );
}