"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gavel,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  MapPin,
  MessageSquare,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { formatCurrency, formatRelativeTime, getInitials } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export default function BidsReceivedPage() {
  const { toast } = useToast();
  const [actionDialog, setActionDialog] = useState<{
    bidId: string;
    action: "accept" | "reject";
    cropName: string;
    buyerName: string;
    amount: number;
  } | null>(null);

  const { data: listings, isLoading, refetch } = api.crop.getMyListings.useQuery({});

  const acceptMutation = api.bid.accept.useMutation({
    onSuccess: () => {
      toast({
        title: "Bid Accepted!",
        description: "The buyer will be notified",
        variant: "success",
      });
      setActionDialog(null);
      void refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = api.bid.reject.useMutation({
    onSuccess: () => {
      toast({
        title: "Bid Rejected",
        description: "The buyer will be notified",
      });
      setActionDialog(null);
      void refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get all bids from all listings
  const allBids =
    listings?.flatMap((listing) =>
      listing.bids.map((bid) => ({
        ...bid,
        listing: {
          id: listing.id,
          cropName: listing.cropName,
          unit: listing.unit,
          expectedPrice: listing.expectedPrice,
        },
      }))
    ) ?? [];

  const pendingBids = allBids.filter((b) => b.status === "PENDING");
  const acceptedBids = allBids.filter((b) => b.status === "ACCEPTED");
  const rejectedBids = allBids.filter((b) => b.status === "REJECTED");

  // Stats
  const totalValue = acceptedBids.reduce(
    (sum, b) => sum + b.bidAmount * b.quantity,
    0
  );

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
      <div>
        <h1 className="text-2xl font-bold">Bids Received</h1>
        <p className="text-muted-foreground">Manage incoming bids on your listings</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Gavel className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allBids.length}</p>
                <p className="text-xs text-muted-foreground">Total Bids</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{pendingBids.length}</p>
                <p className="text-xs text-amber-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedBids.length}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-muted-foreground">Accepted Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bids Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingBids.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Accepted ({acceptedBids.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedBids.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No pending bids</p>
                <p className="text-sm text-muted-foreground mt-1">
                  When buyers place bids on your listings, they&apos;ll appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingBids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onAccept={() =>
                    setActionDialog({
                      bidId: bid.id,
                      action: "accept",
                      cropName: bid.listing.cropName,
                      buyerName: bid.buyer.name ?? "Buyer",
                      amount: bid.bidAmount,
                    })
                  }
                  onReject={() =>
                    setActionDialog({
                      bidId: bid.id,
                      action: "reject",
                      cropName: bid.listing.cropName,
                      buyerName: bid.buyer.name ?? "Buyer",
                      amount: bid.bidAmount,
                    })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedBids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No accepted bids yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acceptedBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} showContact />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedBids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No rejected bids</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === "accept" ? "Accept Bid" : "Reject Bid"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.action === "accept" ? (
                <>
                  Accept <strong>{actionDialog.buyerName}</strong>&apos;s bid of{" "}
                  <strong>{formatCurrency(actionDialog?.amount ?? 0)}</strong> for{" "}
                  <strong>{actionDialog?.cropName}</strong>?
                </>
              ) : (
                <>
                  Reject <strong>{actionDialog?.buyerName}</strong>&apos;s bid for{" "}
                  <strong>{actionDialog?.cropName}</strong>? This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            {actionDialog?.action === "accept" ? (
              <Button
                onClick={() => acceptMutation.mutate({ bidId: actionDialog.bidId })}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? "Accepting..." : "Accept Bid"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() =>
                  actionDialog && rejectMutation.mutate({ bidId: actionDialog.bidId })
                }
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject Bid"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BidCard({
  bid,
  onAccept,
  onReject,
  showContact,
}: {
  bid: {
    id: string;
    bidAmount: number;
    quantity: number;
    status: string;
    message: string | null;
    createdAt: Date;
    buyer: {
      id: string;
      name: string | null;
      image: string | null;
      city: string | null;
      state: string | null;
    };
    listing: {
      id: string;
      cropName: string;
      unit: string;
      expectedPrice: number;
    };
  };
  onAccept?: () => void;
  onReject?: () => void;
  showContact?: boolean;
}) {
  const priceDiff =
    ((bid.bidAmount - bid.listing.expectedPrice) / bid.listing.expectedPrice) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Buyer + Listing Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={bid.buyer.image ?? undefined} />
              <AvatarFallback className="bg-secondary/10 text-secondary">
                {getInitials(bid.buyer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{bid.buyer.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {bid.buyer.city}, {bid.buyer.state}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Bid on <Link href={`/dashboard/listings`} className="text-primary hover:underline">{bid.listing.cropName}</Link>
              </p>
              {bid.message && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  &quot;{bid.message}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Right: Bid Details + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
            {/* Bid Amount */}
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Bid Amount</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(bid.bidAmount)}/{bid.listing.unit}
                </p>
                <Badge
                  variant={priceDiff >= 0 ? "success" : "destructive"}
                  className="mt-1"
                >
                  {priceDiff >= 0 ? "+" : ""}
                  {priceDiff.toFixed(1)}%
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="text-lg font-semibold">
                  {bid.quantity} {bid.listing.unit}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-lg font-bold">
                  {formatCurrency(bid.bidAmount * bid.quantity)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {bid.status === "PENDING" && onAccept && onReject && (
                <>
                  <Button size="sm" onClick={onAccept}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={onReject}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {showContact && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/messages?user=${bid.buyer.id}`}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contact
                  </Link>
                </Button>
              )}
              {bid.status === "ACCEPTED" && !showContact && (
                <Badge variant="success">Accepted</Badge>
              )}
              {bid.status === "REJECTED" && (
                <Badge variant="secondary">Rejected</Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-right">
          {formatRelativeTime(bid.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}
