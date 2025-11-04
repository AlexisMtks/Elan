import { PageTitle } from "@/components/misc/page-title";

export default function MessagesPage() {
    return (
        <div className="space-y-4">
            <PageTitle
                title="Messages"
                subtitle="Chat with buyers and sellers."
            />
            <p className="text-sm text-muted-foreground">
                TODO: implement messaging UI (conversation list, chat window, message input).
            </p>
        </div>
    );
}