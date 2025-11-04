interface PageTitleProps {
    title: string;
    subtitle?: string;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
            {subtitle && (
                <p className="max-w-2xl text-sm text-muted-foreground">
                    {subtitle}
                </p>
            )}
        </div>
    );
}