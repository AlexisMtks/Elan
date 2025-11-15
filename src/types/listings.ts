// src/types/listings.ts
export type ListingCondition =
    | "new"
    | "like_new"
    | "very_good"
    | "good"
    | "used";

export type ListingSortBy =
    | "relevance"
    | "price_asc"
    | "price_desc"
    | "newest"
    | "oldest";

export interface ListingFilters {
    search: string;
    categoryId: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    city: string;
    country: string;
    condition: ListingCondition | null;
    isNegotiableOnly: boolean;
    maxShippingTime: number | null;
    sortBy: ListingSortBy;
}