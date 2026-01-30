"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, MapPin, Star, Package, ArrowUpDown } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { formatCurrency, getInitials } from "~/lib/utils";
import { api } from "~/trpc/react";

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "GRAINS", label: "🌾 Grains" },
  { value: "VEGETABLES", label: "🥬 Vegetables" },
  { value: "FRUITS", label: "🍎 Fruits" },
  { value: "PULSES", label: "🫘 Pulses" },
  { value: "OILSEEDS", label: "🌻 Oilseeds" },
  { value: "SPICES", label: "🌶️ Spices" },
  { value: "OTHER", label: "🌱 Other" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "quantity", label: "Quantity" },
];

export default function BrowseCropsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "quantity">("newest");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.crop.getAll.useInfiniteQuery(
      {
        search: search || undefined,
        category: category !== "ALL" ? (category as "GRAINS" | "VEGETABLES" | "FRUITS" | "PULSES" | "OILSEEDS" | "SPICES" | "OTHER") : undefined,
        sortBy,
        limit: 12,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const listings = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Browse Crops</h1>
        <p className="text-muted-foreground">Find fresh crops from verified farmers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No crops found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/dashboard/browse/${listing.id}`}
                className="block"
              >
                <Card className="h-full hover:border-primary hover:shadow-md transition-all">
                  <CardContent className="pt-6 space-y-4">
                    {/* Crop Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{listing.cropName}</h3>
                        <Badge variant="outline" className="mt-1">
                          {listing.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(listing.expectedPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          per {listing.unit}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-medium">
                        {listing.quantity} {listing.unit}
                      </span>
                    </div>

                    {/* Farmer Info */}
                    <div className="flex items-center gap-3 pt-3 border-t">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={listing.farmer.image ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(listing.farmer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{listing.farmer.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {listing.farmer.city}, {listing.farmer.state}
                          </span>
                        </div>
                      </div>
                      {listing.farmer.avgRating > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">
                            {listing.farmer.avgRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bids Count */}
                    <div className="text-xs text-muted-foreground">
                      {listing._count.bids} bid{listing._count.bids !== 1 ? "s" : ""} placed
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
