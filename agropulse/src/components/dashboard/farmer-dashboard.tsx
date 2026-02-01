"use client";

import Link from "next/link";
import { Package, TrendingUp, Plus, ArrowRight, Gavel, Sparkles, Leaf, Cloud, FlaskConical, Brain } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import { formatCurrency, formatRelativeTime, getInitials } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useLanguage } from "~/providers/language-provider";

export function FarmerDashboard() {
  const { data: stats, isLoading: statsLoading } = api.crop.getStats.useQuery();
  const { data: listings, isLoading: listingsLoading } = api.crop.getMyListings.useQuery({ status: undefined });
  const { t } = useLanguage();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.welcomeBack")} 👋</h1>
          <p className="text-muted-foreground">{t("dashboard.farmerWelcomeDesc")}</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/listings/new">
            <Plus className="h-5 w-5" />
            {t("dashboard.newListing")}
          </Link>
        </Button>
      </div>

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.activeListings")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeListings ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.activeListingsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.totalBids")}</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBids ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.totalBidsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.soldCrops")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.soldListings ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.soldCropsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.aiInsights")}</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-primary">{t("dashboard.stats.aiInsightsDesc")}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.aiInsightsSubDesc")}
            </p>
          </CardContent>
        </Card>
      </div>

      
      <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-secondary" />
            AI-Powered Tools
          </CardTitle>
          <CardDescription>
            Smart farming assistance powered by Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/ai-assistant?tab=disease" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-green-400 hover:shadow-sm transition-all">
                <Leaf className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">Disease Detection</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Identify crop diseases from symptoms
                </p>
              </div>
            </Link>
            <Link href="/dashboard/ai-assistant?tab=weather" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all">
                <Cloud className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">Weather Advice</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Get farming tips based on weather
                </p>
              </div>
            </Link>
            <Link href="/dashboard/ai-assistant?tab=soil" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-amber-400 hover:shadow-sm transition-all">
                <FlaskConical className="h-6 w-6 text-amber-600 mb-2" />
                <h4 className="font-medium">Soil Analysis</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Analyze soil health & get tips
                </p>
              </div>
            </Link>
            <Link href="/dashboard/ai-assistant?tab=prices" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-green-400 hover:shadow-sm transition-all">
                <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">Price Comparison</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Compare prices across markets
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

    
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("dashboard.recentBids")}</CardTitle>
            <CardDescription>{t("dashboard.recentBidsDesc")}</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/bids">
              {t("common.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
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
                        {t("dashboard.bidOn", { crop: bid.listing.cropName })}
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
              <p>{t("dashboard.noBidsYet")}</p>
              <p className="text-sm">{t("dashboard.createListingPrompt")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("nav.myListings")}</CardTitle>
            <CardDescription>{t("dashboard.myListingsDesc")}</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/listings">
              {t("common.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
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
                    {listing._count.bids} {t("dashboard.bids")}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("dashboard.noListingsYet")}</p>
              <Button asChild className="mt-3">
                <Link href="/dashboard/listings/new">{t("dashboard.createFirstListing")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
