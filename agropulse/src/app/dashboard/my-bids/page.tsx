"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { formatCurrency, formatRelativeTime } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

const STATUS_CONFIG = {
  PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: "Pending" },
  ACCEPTED: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", label: "Accepted" },
  REJECTED: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Rejected" },
  CANCELLED: { icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-50", label: "Cancelled" },
  EXPIRED: { icon: Clock, color: "text-gray-500", bg: "bg-gray-50", label: "Expired" },
};

export default function MyBidsPage() {
  const { toast } = useToast();
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);

  const { data: bids, isLoading, refetch } = api.bid.getMyBids.useQuery({});
  const { data: stats } = api.bid.getStats.useQuery();

  const cancelMutation = api.bid.cancel.useMutation({
    onSuccess: () => {
      toast({
        title: "Bid Cancelled",
        description: "Your bid has been cancelled",
      });
      setCancelDialogId(null);
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

  const pendingBids = bids?.filter((b) => b.status === "PENDING") ?? [];
  const acceptedBids = bids?.filter((b) => b.status === "ACCEPTED") ?? [];
  const otherBids = bids?.filter((b) => ["REJECTED", "CANCELLED", "EXPIRED"].includes(b.status)) ?? [];

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
        <h1 className="text-2xl font-bold">My Bids</h1>
        <p className="text-muted-foreground">Track and manage your placed bids</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeBids ?? 0}</p>
                <p className="text-xs text-muted-foreground">Active Bids</p>
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
                <p className="text-2xl font-bold">{stats?.acceptedBids ?? 0}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.totalSpent ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
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
          <TabsTrigger value="other" className="gap-2">
            <XCircle className="h-4 w-4" />
            Other ({otherBids.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No pending bids</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/browse">Browse Crops</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingBids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onCancel={() => setCancelDialogId(bid.id)}
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
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          {otherBids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No rejected or cancelled bids</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {otherBids.map((bid) => (
                <BidCard key={bid.id} bid={bid} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialogId} onOpenChange={() => setCancelDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this bid? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogId(null)}>
              Keep Bid
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelDialogId && cancelMutation.mutate({ bidId: cancelDialogId })}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BidCard({
  bid,
  onCancel,
}: {
  bid: {
    id: string;
    bidAmount: number;
    quantity: number;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
    createdAt: Date;
    listing: {
      id: string;
      cropName: string;
      unit: string;
      farmer: {
        name: string | null;
      };
    };
  };
  onCancel?: () => void;
}) {
  const config = STATUS_CONFIG[bid.status];
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${config.bg}`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <Link
                href={`/dashboard/browse/${bid.listing.id}`}
                className="font-semibold text-lg hover:text-primary transition-colors"
              >
                {bid.listing.cropName}
              </Link>
              <p className="text-sm text-muted-foreground">
                Seller: {bid.listing.farmer.name}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Your Bid</p>
                  <p className="font-semibold text-primary">
                    {formatCurrency(bid.bidAmount)}/{bid.listing.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-medium">
                    {bid.quantity} {bid.listing.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold">
                    {formatCurrency(bid.bidAmount * bid.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={
                bid.status === "ACCEPTED"
                  ? "success"
                  : bid.status === "REJECTED"
                  ? "destructive"
                  : bid.status === "PENDING"
                  ? "default"
                  : "secondary"
              }
            >
              {config.label}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(bid.createdAt)}
            </p>
            {bid.status === "PENDING" && onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel Bid
              </Button>
            )}
            {bid.status === "ACCEPTED" && (
              <Button size="sm" asChild>
                <Link href={`/dashboard/messages?user=${bid.listing.farmer.name}`}>
                  Contact Seller
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
