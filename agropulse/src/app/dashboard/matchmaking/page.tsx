"use client";

import Link from "next/link";
import {
  MapPin,
  Star,
  TrendingUp,
  Sparkles,
  User,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatCurrency, getInitials } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function MatchmakingPage() {
  const { data: recommendations, isLoading } =
    api.matchmaking.getRecommendationsForBuyer.useQuery();

  return (
    <div className="space-y-6">
    
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          Smart Recommendations
        </h1>
        <p className="text-muted-foreground">
          AI-powered crop recommendations based on your preferences and location
        </p>
      </div>

      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <Card
                key={rec.id}
                className="hover:shadow-md transition-shadow border-l-4 border-l-primary"
              >
                <CardContent className="pt-6 space-y-4">
                  {/* Recommendation Reasons */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Recommended
                    </Badge>
                    {rec.recommendationReasons.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {rec.recommendationReasons[0]}
                      </span>
                    )}
                  </div>

                  {/* Crop Info */}
                  <div>
                    <Link
                      href={`/dashboard/browse/${rec.id}`}
                      className="font-semibold text-lg hover:text-primary transition-colors"
                    >
                      {rec.cropName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{rec.category}</Badge>
                      {rec.qualityGrade && (
                        <Badge variant="secondary">
                          Grade {rec.qualityGrade}
                        </Badge>
                      )}
                    </div>
                  </div>

            
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(rec.expectedPrice)}/
                        {rec.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="font-medium">
                        {rec.quantity} {rec.unit}
                      </p>
                    </div>
                  </div>

                 
                  <div className="flex items-center gap-3 pt-3 border-t">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={rec.farmer.image ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(rec.farmer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{rec.farmer.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {rec.farmer.city}, {rec.farmer.state}
                      </div>
                    </div>
                    {rec.farmer.avgRating > 0 && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">
                          {rec.farmer.avgRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/browse/${rec.id}`}>
                      View & Place Bid
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No recommendations available at the moment
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your profile and browse some crops to get personalized
              recommendations
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/browse">Browse All Crops</Link>
            </Button>
          </CardContent>
        </Card>
      )}

    
      <Card className="bg-secondary/5 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            How We Match You
          </CardTitle>
          <CardDescription>
            Our AI considers multiple factors to find the best matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 text-secondary font-medium mb-2">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <p className="text-sm text-muted-foreground">
                Proximity to reduce transport costs and ensure freshness
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 text-secondary font-medium mb-2">
                <Star className="h-4 w-4" />
                Trust Score
              </div>
              <p className="text-sm text-muted-foreground">
                Seller ratings and transaction history
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 text-secondary font-medium mb-2">
                <TrendingUp className="h-4 w-4" />
                Price Value
              </div>
              <p className="text-sm text-muted-foreground">
                Competitive pricing compared to market averages
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 text-secondary font-medium mb-2">
                <User className="h-4 w-4" />
                Preferences
              </div>
              <p className="text-sm text-muted-foreground">
                Your past purchases and browsing patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
