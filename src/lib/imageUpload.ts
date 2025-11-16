// src/lib/imageUpload.ts
import { supabase } from "@/lib/supabaseClient";

const AVATAR_BUCKET = "avatars";
const LISTING_BUCKET = "listing-images";

// Petit helper pour récupérer l'extension du fichier
function getFileExtension(file: File): string {
    const parts = file.name.split(".");
    if (parts.length < 2) return "jpg";
    return parts.pop() || "jpg";
}

type UploadResult = {
    path: string;
    publicUrl: string;
};

/**
 * Upload générique vers un bucket Supabase Storage.
 * Réutilisable pour avatars, images d'annonces, etc.
 */
async function uploadToBucket(params: {
    bucket: string;
    file: File;
    path: string;
}): Promise<UploadResult> {
    const { bucket, file, path } = params;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (error) {
        throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
        path,
        publicUrl: data.publicUrl,
    };
}

/**
 * Upload d'un avatar utilisateur dans le bucket "avatars".
 * On versionne par userId pour rester propre.
 */
export async function uploadAvatarImage(
    userId: string,
    file: File
): Promise<UploadResult> {
    const ext = getFileExtension(file);
    const fileName = `avatar-${crypto.randomUUID()}.${ext}`;
    const path = `${userId}/${fileName}`;

    return uploadToBucket({
        bucket: AVATAR_BUCKET,
        file,
        path,
    });
}

/**
 * Préparation pour plus tard : upload d'images d'annonce.
 * On ne l’utilise pas encore, mais il est prêt.
 */
export async function uploadListingImage(
    listingId: string,
    file: File,
    index = 0
): Promise<UploadResult> {
    const ext = getFileExtension(file);
    const fileName = `listing-${listingId}-${index}-${crypto.randomUUID()}.${ext}`;
    const path = `${listingId}/${fileName}`;

    return uploadToBucket({
        bucket: LISTING_BUCKET,
        file,
        path,
    });
}