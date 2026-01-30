"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  Gavel,
  Clock,
  User,
  Loader2,
  MessageSquare,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Spinner } from "~/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { formatCurrency, formatRelativeTime, getInitials } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export default function CropDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidQuantity, setBidQuantity] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  const { data: listing, isLoading } = api.crop.getById.useQuery({ id });
  const { data: bids, refetch: refetchBids } = api.bid.getForListing.useQuery(
    { listingId: id },
    { refetchInterval: 5000 } // Real-time polling every 5 seconds
  );

  const placeBidMutation = api.bid.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Bid Placed!",
        description: "Your bid has been submitted successfully",
        variant: "success",
      });
      setBidDialogOpen(false);
      setBidAmount("");
      setBidQuantity("");
      setBidMessage("");
      void refetchBids();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlaceBid = () => {
    if (!bidAmount || !bidQuantity) {
      toast({
        title: "Missing Fields",
        description: "Please enter bid amount and quantity",
        variant: "destructive",
      });
      return;
    }

    placeBidMutation.mutate({
      listingId: id,
      bidAmount: parseFloat(bidAmount),
      quantity: parseFloat(bidQuantity),
      message: bidMessage || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Listing not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/browse">Back to Browse</Link>
        </Button>
      </div>
    );
  }

  const highestBid = bids?.[0]?.bidAmount ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{listing.cropName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{listing.category}</Badge>
            {listing.qualityGrade && (
              <Badge variant="secondary">Grade {listing.qualityGrade}</Badge>
            )}
            {listing.isCertified && (
              <Badge variant="success">Certified</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crop Details */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity Available</p>
                  <p className="text-xl font-semibold">
                    {listing.quantity} {listing.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Price</p>
                  <p className="text-xl font-semibold text-primary">
                    {formatCurrency(listing.expectedPrice)}/{listing.unit}
                  </p>
                </div>
              </div>

              {listing.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p>{listing.description}</p>
                </div>
              )}

              {listing.harvestLocation && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Harvest Location: {listing.harvestLocation}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Listed {formatRelativeTime(listing.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Live Bids */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Live Bids
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </CardTitle>
                <CardDescription>
                  {listing._count.bids} total bid{listing._count.bids !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              {highestBid > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Highest Bid</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(highestBid)}/{listing.unit}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {bids && bids.length > 0 ? (
                <div className="space-y-3">
                  {bids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          #{index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={bid.buyer.image ?? undefined} />
                          <AvatarFallback>
                            {getInitials(bid.buyer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{bid.buyer.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {bid.buyer.city}, {bid.buyer.state}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${index === 0 ? "text-green-600" : ""}`}>
                          {formatCurrency(bid.bidAmount)}/{listing.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          for {bid.quantity} {listing.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No bids yet. Be the first to bid!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Farmer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={listing.farmer.image ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(listing.farmer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{listing.farmer.name}</p>
                  <div className="flex items-center gap-2">
                    {listing.farmer.avgRating > 0 && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">
                          {listing.farmer.avgRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({listing.farmer.totalRatings} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {listing.farmer.city}, {listing.farmer.state}
                  </span>
                </div>
                {listing.farmer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.farmer.phone}</span>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full gap-2" asChild>
                <Link href={`/dashboard/messages?user=${listing.farmer.id}`}>
                  <MessageSquare className="h-4 w-4" />
                  Contact Seller
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Place Bid */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Place Your Bid</CardTitle>
              <CardDescription>
                Current highest: {highestBid > 0 ? formatCurrency(highestBid) : "No bids yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <Gavel className="mr-2 h-5 w-5" />
                    Place Bid
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Place Bid on {listing.cropName}</DialogTitle>
                    <DialogDescription>
                      Expected price: {formatCurrency(listing.expectedPrice)}/{listing.unit}
                      {highestBid > 0 && (
                        <> | Current highest: {formatCurrency(highestBid)}/{listing.unit}</>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bid Amount (₹/{listing.unit})</Label>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder={highestBid > 0 ? `>${highestBid}` : "2500"}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity ({listing.unit})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max={listing.quantity}
                          placeholder={`Max ${listing.quantity}`}
                          value={bidQuantity}
                          onChange={(e) => setBidQuantity(e.target.value)}
                        />
                      </div>
                    </div>

                    {bidAmount && bidQuantity && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(parseFloat(bidAmount) * parseFloat(bidQuantity))}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Message (Optional)</Label>
                      <Textarea
                        placeholder="Add a note for the seller..."
                        rows={3}
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePlaceBid}
                      disabled={placeBidMutation.isPending}
                    >
                      {placeBidMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing...
                        </>
                      ) : (
                        "Confirm Bid"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <p className="text-xs text-center text-muted-foreground mt-3">
                Your bid will be visible to the seller immediately
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
