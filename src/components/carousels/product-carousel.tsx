import { ProductCard } from "@/components/cards/product-card";

interface ProductCarouselItem {
    id: string;
    title: string;
    price: number;
    location?: string;
    subtitle?: string;
}

interface ProductCarouselProps {
    title: string;
    items: ProductCarouselItem[];
}

export function ProductCarousel({ title, items }: ProductCarouselProps) {
    if (!items.length) return null;

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold">{title}</h2>

            <div className="-mx-1 flex gap-4 overflow-x-auto pb-1">
                {items.map((item) => (
                    <div key={item.id} className="w-[220px] flex-shrink-0 px-1">
                        <ProductCard
                            id={item.id}
                            title={item.title}
                            price={item.price}
                            location={item.location}
                            subtitle={item.subtitle}
                            variant="compact"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}