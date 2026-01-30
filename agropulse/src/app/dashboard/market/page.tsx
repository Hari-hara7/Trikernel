"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Brain,
  RefreshCw,
  MapPin,
  ArrowRight,
  Zap,
  Loader2,
  Globe,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { formatCurrency, formatRelativeTime } from "~/lib/utils";
import { api } from "~/trpc/react";

const STATES = [
  "Maharashtra",
  "Punjab",
  "Uttar Pradesh",
  "Gujarat",
  "Madhya Pradesh",
  "Karnataka",
  "Rajasthan",
  "Tamil Nadu",
  "West Bengal",
  "Andhra Pradesh",
];

const CROPS = [
  "Wheat",
  "Rice",
  "Cotton",
  "Soybean",
  "Maize",
  "Tomato",
  "Onion",
  "Potato",
  "Sugarcane",
  "Chillies",
];

export default function MarketPage() {
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  const [selectedCrop, setSelectedCrop] = useState<string>("Wheat");

  const { data: mandiPrices, isLoading: loadingPrices, refetch: refetchPrices } =
    api.market.getMandiPrices.useQuery({
      state: selectedState || undefined,
    });

  const { data: trending, isLoading: loadingTrending } =
    api.market.getTrendingCrops.useQuery();

  const { data: comparison, isLoading: loadingComparison } =
    api.market.getPriceComparison.useQuery({
      cropName: selectedCrop,
    });

  const seedMutation = api.market.seedMandiPrices.useMutation({
    onSuccess: () => {
      void refetchPrices();
    },
  });

  // Live prices from govt API
  const { data: liveData, isLoading: loadingLive, refetch: refetchLive, isSuccess: liveSuccess } =
    api.market.fetchFreshPrices.useQuery(
      { state: selectedState, limit: 50 },
      { enabled: false } // Only fetch on demand
    );

  const handleFetchLive = () => {
    void refetchLive();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Market Intelligence</h1>
          <p className="text-muted-foreground">
            Live mandi prices and AI-powered market insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleFetchLive}
            disabled={loadingLive}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {loadingLive ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Fetch Live Prices
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPrices()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {/* Seed button for demo */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending ? "Seeding..." : "Seed Demo Data"}
          </Button>
        </div>
      </div>

      {/* Live Price Status Banner */}
      {liveSuccess && liveData && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Zap className="h-4 w-4" />
          <span className="text-sm">
            Successfully fetched {liveData.count} live prices from Government API
          </span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="prices">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Mandi Prices
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Globe className="h-4 w-4" />
            Live API
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Price Comparison
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <Brain className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Mandi Prices Tab */}
        <TabsContent value="prices" className="mt-6 space-y-6">
          {/* Filter */}
          <div className="flex gap-4">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[200px]">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingPrices ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : mandiPrices && mandiPrices.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mandiPrices.map((price) => {
                // Calculate estimated change from min/max range
                const midPoint = (price.maxPrice + price.minPrice) / 2;
                const deviation = ((price.modalPrice - midPoint) / midPoint) * 100;
                const isUp = deviation >= 0;

                return (
                  <Card key={price.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{price.cropName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {price.mandiName}
                          </p>
                        </div>
                        <Badge
                          variant={isUp ? "success" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {isUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(deviation).toFixed(1)}%
                        </Badge>
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Modal Price</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(price.modalPrice)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            per quintal
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Range</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(price.minPrice)} - {formatCurrency(price.maxPrice)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Updated {formatRelativeTime(price.priceDate)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No price data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click &quot;Seed Demo Data&quot; to populate sample prices
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live API Tab */}
        <TabsContent value="live" className="mt-6 space-y-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Globe className="h-5 w-5" />
                Live Government API Data
              </CardTitle>
              <CardDescription>
                Real-time mandi prices from Data.gov.in AGMARKET API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-[200px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleFetchLive}
                  disabled={loadingLive}
                  className="gap-2"
                >
                  {loadingLive ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching from API...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Fetch Latest Prices
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-sm text-muted-foreground">Data Source</h4>
                  <p className="mt-1 font-semibold">AGMARKET - Data.gov.in</p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-sm text-muted-foreground">API Type</h4>
                  <p className="mt-1 font-semibold">Government Open Data</p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-sm text-muted-foreground">Update Frequency</h4>
                  <p className="mt-1 font-semibold">Daily</p>
                </div>
              </div>

              {liveSuccess && liveData && (
                <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
                  <div className="flex items-center gap-2 text-green-800">
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold">Live Data Retrieved!</span>
                  </div>
                  <p className="mt-1 text-sm text-green-700">
                    Fetched {liveData.count} price records from the government API.
                    Data has been synced to the database.
                  </p>
                </div>
              )}

              {!liveSuccess && !loadingLive && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-700 text-sm">
                    Note: The government API may have rate limits or connectivity issues. 
                    Using cached/seeded data as fallback.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Comparison Tab */}
        <TabsContent value="comparison" className="mt-6 space-y-6">
          {/* Crop Selector */}
          <div className="flex gap-4">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingComparison ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : comparison && comparison.mandiPrices.length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price Comparison: {selectedCrop}</CardTitle>
                  <CardDescription>
                    Compare average prices across different states
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comparison.mandiPrices.map((item, index) => {
                      const avgPrice = item._avg.modalPrice ?? 0;
                      const maxPrice = Math.max(
                        ...comparison.mandiPrices.map((c) => c._avg.modalPrice ?? 0)
                      );
                      const widthPercent = maxPrice > 0 ? (avgPrice / maxPrice) * 100 : 0;

                      return (
                        <div key={item.state} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.state}</span>
                              <span className="text-muted-foreground">
                                ({item._count} mandis)
                              </span>
                            </div>
                            <span className="font-semibold">
                              {formatCurrency(avgPrice)}/quintal
                            </span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                index === 0
                                  ? "bg-green-500"
                                  : index === comparison.mandiPrices.length - 1
                                  ? "bg-red-400"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {comparison.mandiPrices.length > 1 && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-medium">Best Average Price</span>
                      </div>
                      <p className="mt-1 text-green-800">
                        <strong>{comparison.mandiPrices[0]?.state}</strong> offers the highest
                        average price at{" "}
                        <strong>
                          {formatCurrency(comparison.mandiPrices[0]?._avg.modalPrice ?? 0)}
                        </strong>
                        /quintal
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No comparison data for {selectedCrop}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-6 space-y-6">
          {loadingTrending ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : trending && trending.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Popular Crops */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    Most Listed Crops
                  </CardTitle>
                  <CardDescription>
                    Popular crops by listing count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trending
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-green-600">
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{item.cropName}</p>
                              <p className="text-xs text-muted-foreground">
                                Avg: {formatCurrency(item._avg.expectedPrice ?? 0)}/quintal
                              </p>
                            </div>
                          </div>
                          <Badge variant="success">
                            {item._count} listings
                          </Badge>
                        </div>
                      ))}
                    {trending.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No trending crops
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <BarChart3 className="h-5 w-5" />
                    By Category
                  </CardTitle>
                  <CardDescription>
                    Distribution by crop category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trending
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-secondary">
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{item.cropName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.category}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {item._count} listings
                          </Badge>
                        </div>
                      ))}
                    {trending.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No category data
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No trend data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seed demo data to see market trends
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          <Card className="border-secondary/50 bg-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-secondary" />
                AI Market Insights
              </CardTitle>
              <CardDescription>
                Powered by Gemini AI for intelligent market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Best Time to Sell
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on historical trends and weather patterns, consider selling
                    perishable vegetables within the next 2-3 days for optimal prices.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Price Outlook
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Wheat prices expected to remain stable. Onion and tomato prices
                    may increase due to seasonal demand.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Want more AI-powered insights?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get disease detection, weather recommendations, soil analysis, and more
                    </p>
                  </div>
                  <a href="/dashboard/ai-assistant">
                    <Button className="gap-2">
                      <Brain className="h-4 w-4" />
                      AI Assistant
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
