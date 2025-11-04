import Link from "next/link";
import { PageTitle } from "@/components/misc/page-title";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 text-center">
            <PageTitle title="Page not found" />
            <p className="text-sm text-muted-foreground">
                The page you are looking for does not exist or has been moved.
            </p>
            <Button asChild>
                <Link href="/">Back to home</Link>
            </Button>
        </div>
    );
}