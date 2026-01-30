"use client";

import Link from "next/link";
import { Package, TrendingUp, Plus, ArrowRight, Gavel, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import { formatCurrency, formatRelativeTime, getInitials } from "~/lib/utils";
import { api } from "~/trpc/react";

export function FarmerDashboard() {
  const { data: stats, isLoading: statsLoading } = api.crop.getStats.useQuery();
  const { data: listings, isLoading: listingsLoading } = api.crop.getMyListings.useQuery({ status: undefined });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your farm today.</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/listings/new">
            <Plus className="h-5 w-5" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeListings ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              crops available for bidding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBids ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              bids received on your crops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Crops</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.soldListings ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              successfully sold this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-primary">Price predictions available</div>
            <p className="text-xs text-muted-foreground">
              Get AI-powered selling suggestions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bids */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Bids</CardTitle>
            <CardDescription>Latest bids on your crop listings</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/bids">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.recentBids && stats.recentBids.length > 0 ? (
            <div className="space-y-4">
              {stats.recentBids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={bid.buyer.image ?? undefined} />
                      <AvatarFallback>{getInitials(bid.buyer.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{bid.buyer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Bid on {bid.listing.cropName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatCurrency(bid.bidAmount)}/quintal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(bid.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No bids yet</p>
              <p className="text-sm">Create a listing to start receiving bids</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Listings</CardTitle>
            <CardDescription>Your active crop listings</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/listings">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {listingsLoading ? (
            <Spinner />
          ) : listings && listings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings.slice(0, 6).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/dashboard/listings/${listing.id}`}
                  className="block p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{listing.cropName}</h4>
                    <Badge
                      variant={listing.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{listing.quantity} {listing.unit}</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(listing.expectedPrice)}/{listing.unit}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Gavel className="h-3 w-3" />
                    {listing._count.bids} bids
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No listings yet</p>
              <Button asChild className="mt-3">
                <Link href="/dashboard/listings/new">Create Your First Listing</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
