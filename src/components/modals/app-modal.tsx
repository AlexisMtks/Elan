"use client";

import { ReactNode, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AppModalVariant = "default" | "change-password";

type BaseProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type DefaultVariantProps = {
    variant?: "default";
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
};

type ChangePasswordVariantProps = {
    variant: "change-password";
    title?: string;
    description?: string;
    onSubmit: (data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => Promise<void> | void;
};

export type AppModalProps = BaseProps &
    (DefaultVariantProps | ChangePasswordVariantProps);

export function AppModal(props: AppModalProps) {
    if (props.variant === "change-password") {
        return <ChangePasswordModal {...props} />;
    }

    const { open, onOpenChange, title, description, children, footer } = props;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="space-y-4">{children}</div>
                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}

type ChangePasswordModalInnerProps = Extract<
    AppModalProps,
    { variant: "change-password" }
>;

function ChangePasswordModal({
                                 open,
                                 onOpenChange,
                                 title = "Modifier le mot de passe",
                                 description = "Pour des raisons de sécurité, vous devrez saisir votre mot de passe actuel.",
                                 onSubmit,
                             }: ChangePasswordModalInnerProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Merci de remplir tous les champs.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            setSuccess("Votre mot de passe a été mis à jour.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            // Optionnel : fermer automatiquement après succès
            // onOpenChange(false);
        } catch (e) {
            const message =
                e instanceof Error ? e.message : "Une erreur est survenue.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setError(null);
        setSuccess(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Ancien mot de passe
                            <Input
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Nouveau mot de passe
                            <Input
                                type="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Confirmer le nouveau mot de passe
                            <Input
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </label>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                    {success && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            {success}
                        </p>
                    )}
                </div>

                <DialogFooter className="mt-4 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={submitting}
                    >
                        Annuler
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Validation..." : "Valider"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}