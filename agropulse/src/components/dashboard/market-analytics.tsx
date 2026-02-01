"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Zap } from "lucide-react";
import { api } from "~/trpc/react";

interface MarketAnalyticsProps {
  cropName?: string;
  location?: string;
}

export function MarketAnalytics({ cropName, location }: MarketAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  
  const { data: marketData, isLoading: marketLoading } = api.market.getMandiPrices.useQuery({
    cropName,
    state: location,
    limit: 10,
  });

  const { data: predictions, isLoading: predictionLoading } = api.market.getAIPredictions.useQuery({
    cropName: cropName || "",
    state: location || "",
  });

  useEffect(() => {
    if (!marketLoading && !predictionLoading) {
      setAnalyticsData({
        market: marketData,
        predictions,
      });
      setLoading(false);
    }
  }, [marketData, marketLoading, predictions, predictionLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{analyticsData?.market?.averagePrice?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.market?.priceChange > 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analyticsData.market.priceChange.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {analyticsData.market.priceChange.toFixed(1)}%
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.market?.totalVolume?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Tons this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.market?.activeListings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.predictions?.confidence || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Prediction accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {analyticsData?.predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Price Prediction
            </CardTitle>
            <CardDescription>
              Smart pricing insights powered by machine learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Predicted Price</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{analyticsData.predictions.predictedPrice?.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Price Range</div>
                <div className="text-lg font-semibold">
                  ₹{analyticsData.predictions.minPrice?.toFixed(2)} - ₹{analyticsData.predictions.maxPrice?.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Best Time to Sell</div>
                <div className="text-lg font-semibold">
                  {analyticsData.predictions.bestTimeToSell}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={analyticsData.predictions.priceTrend === "increasing" ? "default" : "secondary"}>
                  {analyticsData.predictions.priceTrend === "increasing" ? "📈 Rising" :
                   analyticsData.predictions.priceTrend === "decreasing" ? "📉 Falling" : "➡️ Stable"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Market trend for {cropName}
                </span>
              </div>
              <Button variant="outline" size="sm">
                Get Detailed Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>
            Key trends and recommendations based on market data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData?.market?.insights?.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            )) || (
              <p className="text-muted-foreground">No insights available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}