"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Info } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";

const CROP_CATEGORIES = [
  { value: "GRAINS", label: "Grains", emoji: "🌾" },
  { value: "VEGETABLES", label: "Vegetables", emoji: "🥬" },
  { value: "FRUITS", label: "Fruits", emoji: "🍎" },
  { value: "PULSES", label: "Pulses", emoji: "🫘" },
  { value: "OILSEEDS", label: "Oilseeds", emoji: "🌻" },
  { value: "SPICES", label: "Spices", emoji: "🌶️" },
  { value: "OTHER", label: "Other", emoji: "🌱" },
] as const;

const QUALITY_GRADES = ["A+", "A", "B+", "B", "C"];

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cropName: "",
    category: "" as (typeof CROP_CATEGORIES)[number]["value"] | "",
    quantity: "",
    unit: "quintal",
    expectedPrice: "",
    minPrice: "",
    description: "",
    qualityGrade: "",
    isCertified: false,
    harvestLocation: "",
  });

  const createMutation = api.crop.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Listing Created!",
        description: "Your crop listing is now live.",
        variant: "success",
      });
      router.push(`/dashboard/listings/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI Price Prediction (using profile data)
  const { data: profile } = api.auth.getProfile.useQuery();
  const { data: prediction, isLoading: predictionLoading } = api.ai.getPricePrediction.useQuery(
    {
      cropName: formData.cropName,
      quantity: parseFloat(formData.quantity) || 1,
      state: profile?.state ?? "Maharashtra",
      quality: formData.qualityGrade || undefined,
    },
    {
      enabled: formData.cropName.length > 2 && !!profile?.state,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast({
        title: "Select Category",
        description: "Please select a crop category",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      cropName: formData.cropName,
      category: formData.category,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      expectedPrice: parseFloat(formData.expectedPrice),
      minPrice: formData.minPrice ? parseFloat(formData.minPrice) : undefined,
      description: formData.description || undefined,
      qualityGrade: formData.qualityGrade || undefined,
      isCertified: formData.isCertified,
      harvestLocation: formData.harvestLocation || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/listings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">List your crop for sale</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Crop Details</CardTitle>
            <CardDescription>Basic information about your crop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cropName">Crop Name *</Label>
                <Input
                  id="cropName"
                  placeholder="e.g., Wheat, Rice, Tomato"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: typeof formData.category) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quintal">Quintal</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quality Grade</Label>
                <Select
                  value={formData.qualityGrade}
                  onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your crop quality, harvest date, and other details..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestLocation">Harvest Location</Label>
              <Input
                id="harvestLocation"
                placeholder="Village/District name"
                value={formData.harvestLocation}
                onChange={(e) => setFormData({ ...formData, harvestLocation: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your expected price per unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expectedPrice">Expected Price (₹/{formData.unit}) *</Label>
                <Input
                  id="expectedPrice"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="2500"
                  value={formData.expectedPrice}
                  onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimum Acceptable Price (Optional)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="2200"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                />
              </div>
            </div>

            {/* AI Prediction Card */}
            {formData.cropName && profile?.state && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI Price Insights</span>
                  {predictionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>

                {prediction?.predictedPrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Predicted Market Price:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(prediction.predictedPrice)}/{formData.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {Math.round((prediction.confidence ?? 0) * 100)}% confidence
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Source: {prediction.source}
                      </span>
                    </div>
                    {prediction.sellTimeSuggestion && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-white/50 rounded">
                        <Info className="h-4 w-4 text-secondary mt-0.5" />
                        <p className="text-sm">{prediction.sellTimeSuggestion}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {predictionLoading ? "Loading predictions..." : "Enter crop details to get price predictions"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Listing"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
