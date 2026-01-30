"use client";

import Link from "next/link";
import { Plus, Package, Gavel, MoreVertical, Trash2, Edit, Eye } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatCurrency, formatRelativeTime } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

const STATUS_COLORS = {
  ACTIVE: "success",
  SOLD: "info",
  EXPIRED: "secondary",
  CANCELLED: "destructive",
} as const;

export default function ListingsPage() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const { data: listings, isLoading } = api.crop.getMyListings.useQuery({});

  const updateStatusMutation = api.crop.updateStatus.useMutation({
    onSuccess: () => {
      void utils.crop.getMyListings.invalidate();
      toast({
        title: "Status Updated",
        description: "Listing status has been updated",
        variant: "success",
      });
    },
  });

  const deleteMutation = api.crop.delete.useMutation({
    onSuccess: () => {
      void utils.crop.getMyListings.invalidate();
      toast({
        title: "Listing Deleted",
        description: "Your listing has been removed",
        variant: "success",
      });
    },
  });

  const activeListings = listings?.filter((l) => l.status === "ACTIVE") ?? [];
  const soldListings = listings?.filter((l) => l.status === "SOLD") ?? [];
  const otherListings = listings?.filter((l) => !["ACTIVE", "SOLD"].includes(l.status)) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your crop listings</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/listings/new">
            <Plus className="h-5 w-5" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            Active
            {activeListings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeListings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sold" className="gap-2">
            Sold
            {soldListings.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {soldListings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ListingsGrid
            listings={activeListings}
            onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
            onDelete={(id) => deleteMutation.mutate({ id })}
            emptyMessage="No active listings"
            emptyAction={
              <Button asChild>
                <Link href="/dashboard/listings/new">Create Your First Listing</Link>
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="sold">
          <ListingsGrid
            listings={soldListings}
            onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
            onDelete={(id) => deleteMutation.mutate({ id })}
            emptyMessage="No sold listings yet"
          />
        </TabsContent>

        <TabsContent value="other">
          <ListingsGrid
            listings={otherListings}
            onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
            onDelete={(id) => deleteMutation.mutate({ id })}
            emptyMessage="No listings in this category"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ListingsGridProps {
  listings: Array<{
    id: string;
    cropName: string;
    category: string;
    quantity: number;
    unit: string;
    expectedPrice: number;
    status: string;
    createdAt: Date;
    _count: { bids: number };
    bids: Array<{
      id: string;
      bidAmount: number;
      buyer: { id: string; name: string | null; image: string | null };
    }>;
  }>;
  onUpdateStatus: (id: string, status: "ACTIVE" | "SOLD" | "CANCELLED" | "EXPIRED") => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
  emptyAction?: React.ReactNode;
}

function ListingsGrid({
  listings,
  onUpdateStatus,
  onDelete,
  emptyMessage,
  emptyAction,
}: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          {emptyAction}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => {
        const highestBid = listing.bids[0]?.bidAmount ?? 0;

        return (
          <Card key={listing.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{listing.cropName}</CardTitle>
                  <CardDescription>{listing.category}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/listings/${listing.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/listings/${listing.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {listing.status === "ACTIVE" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(listing.id, "CANCELLED")}
                      >
                        Cancel Listing
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(listing.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">
                  {listing.quantity} {listing.unit}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expected Price</span>
                <span className="font-medium text-primary">
                  {formatCurrency(listing.expectedPrice)}/{listing.unit}
                </span>
              </div>

              {highestBid > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Highest Bid</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(highestBid)}/{listing.unit}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Gavel className="h-3 w-3" />
                  {listing._count.bids} bids
                </div>
                <Badge variant={STATUS_COLORS[listing.status as keyof typeof STATUS_COLORS] ?? "secondary"}>
                  {listing.status}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                Created {formatRelativeTime(listing.createdAt)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
