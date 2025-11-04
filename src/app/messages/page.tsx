import { PageTitle } from "@/components/misc/page-title";
import { MessagesPage } from "@/components/messages/messages-page";

export default function MessagesRoutePage() {
    return (
        <div className="space-y-8">
            <PageTitle
                title="Messagerie"
                subtitle="Échangez avec les vendeurs et les acheteurs à propos de vos annonces et commandes."
            />
            <MessagesPage />
        </div>
    );
}