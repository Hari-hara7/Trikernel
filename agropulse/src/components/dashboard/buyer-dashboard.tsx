"use client";

import Link from "next/link";
import { Package, TrendingUp, ShoppingCart, ArrowRight, Search, MapPin, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import { formatCurrency, getInitials } from "~/lib/utils";
import { api } from "~/trpc/react";

export function BuyerDashboard() {
  const { data: stats, isLoading: statsLoading } = api.bid.getStats.useQuery();
  const { data: recommendationsData, isLoading: recsLoading } = api.matchmaking.getRecommendationsForBuyer.useQuery();

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
          <p className="text-muted-foreground">Find the best crops from trusted farmers.</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/browse">
            <Search className="h-5 w-5" />
            Browse Crops
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBids ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              pending bids on crops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.acceptedBids ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              successful purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalSpent ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              on accepted bids
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Match</CardTitle>
            <Star className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-secondary">
              {recommendationsData?.length ?? 0} recommendations
            </div>
            <p className="text-xs text-muted-foreground">
              Based on your preferences
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>Crops matching your preferences and location</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/browse">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recsLoading ? (
            <Spinner />
          ) : recommendationsData && recommendationsData.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendationsData.slice(0, 6).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/dashboard/browse/${listing.id}`}
                  className="block p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{listing.cropName}</h4>
                    <Badge variant="outline">{listing.category}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={listing.farmer.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(listing.farmer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">{listing.farmer.name}</span>
                      {listing.farmer.avgRating > 0 && (
                        <span className="flex items-center text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          {listing.farmer.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {listing.farmer.city}, {listing.farmer.state}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        {listing.quantity} {listing.unit}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(listing.expectedPrice)}/{listing.unit}
                      </span>
                    </div>
                  </div>

                  {listing.recommendationReasons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {listing.recommendationReasons.slice(0, 2).map((reason, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recommendations yet</p>
              <p className="text-sm">Browse crops to get personalized recommendations</p>
              <Button asChild className="mt-3">
                <Link href="/dashboard/browse">Browse Crops</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/dashboard/browse">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Browse Crops</h3>
                  <p className="text-sm text-muted-foreground">Find fresh produce</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/dashboard/my-bids">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">My Bids</h3>
                  <p className="text-sm text-muted-foreground">Track your bids</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/dashboard/market">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Market Prices</h3>
                  <p className="text-sm text-muted-foreground">View live prices</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
