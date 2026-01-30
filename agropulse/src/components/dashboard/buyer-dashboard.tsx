"use client";

import Link from "next/link";
import { Package, TrendingUp, ShoppingCart, ArrowRight, Search, MapPin, Star, Brain, MessageSquare, FileText, BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import { formatCurrency, getInitials } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useLanguage } from "~/providers/language-provider";

export function BuyerDashboard() {
  const { data: stats, isLoading: statsLoading } = api.bid.getStats.useQuery();
  const { data: recommendationsData, isLoading: recsLoading } = api.matchmaking.getRecommendationsForBuyer.useQuery();
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
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.welcomeBack")} 👋</h1>
          <p className="text-muted-foreground">{t("dashboard.buyerWelcomeDesc")}</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/browse">
            <Search className="h-5 w-5" />
            {t("nav.browse")}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.activeBids")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBids ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.activeBidsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.acceptedBids")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.acceptedBids ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.acceptedBidsDesc")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.totalSpent")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalSpent ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.totalSpentDesc")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.smartMatch")}</CardTitle>
            <Star className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-secondary">
              {recommendationsData?.length ?? 0} {t("dashboard.stats.recommendations")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.stats.recommendationsDesc")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Quick Actions for Buyers */}
      <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-secondary" />
            AI-Powered Tools
          </CardTitle>
          <CardDescription>
            Smart buying assistance powered by Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/ai-assistant?tab=prices" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-green-400 hover:shadow-sm transition-all">
                <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium">Price Comparison</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Find best prices across markets
                </p>
              </div>
            </Link>
            <Link href="/dashboard/ai-assistant?tab=negotiate" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-indigo-400 hover:shadow-sm transition-all">
                <MessageSquare className="h-6 w-6 text-indigo-600 mb-2" />
                <h4 className="font-medium">Negotiation Tips</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Get AI advice for negotiations
                </p>
              </div>
            </Link>
            <Link href="/dashboard/ai-assistant?tab=schemes" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-purple-400 hover:shadow-sm transition-all">
                <FileText className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-medium">Govt Schemes</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Find schemes & subsidies
                </p>
              </div>
            </Link>
            <Link href="/dashboard/market" className="block">
              <div className="p-4 bg-white rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all">
                <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium">Market Intelligence</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Live mandi prices & trends
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("dashboard.recommendedForYou")}</CardTitle>
            <CardDescription>{t("dashboard.recommendedDesc")}</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/browse">
              {t("common.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
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
              <p>{t("dashboard.noRecommendationsYet")}</p>
              <p className="text-sm">{t("dashboard.browseForRecommendations")}</p>
              <Button asChild className="mt-3">
                <Link href="/dashboard/browse">{t("nav.browse")}</Link>
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
                  <h3 className="font-semibold">{t("nav.browse")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard.quickActionBrowse")}</p>
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
                  <h3 className="font-semibold">{t("nav.myBids")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard.quickActionMyBids")}</p>
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
                  <h3 className="font-semibold">{t("nav.market")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard.quickActionMarket")}</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
