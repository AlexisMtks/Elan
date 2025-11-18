// src/app/account/page.tsx
import { AccountPageClient } from "@/components/account/account-page-client";
import { AccountHeader } from "@/components/account/account-header";

export default function AccountPage() {
    return (
        <div className="space-y-3">
            <AccountHeader />
            <AccountPageClient />
        </div>
    );
}