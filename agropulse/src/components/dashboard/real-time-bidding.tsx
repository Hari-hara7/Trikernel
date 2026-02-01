"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useSocket } from "~/hooks/use-socket";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { formatCurrency, formatRelativeTime } from "~/lib/utils";
import { Gavel, Clock, TrendingUp } from "lucide-react";

interface RealTimeBiddingProps {
  listingId: string;
}

export function RealTimeBidding({ listingId }: RealTimeBiddingProps) {
  const { data: session } = useSession();
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveBids, setLiveBids] = useState<any[]>([]);

  const { socket, joinListingRoom, placeBid, onNewBid } = useSocket();

  
  const { data: listing, isLoading: listingLoading } = api.crop.getById.useQuery({ id: listingId });

 
  const { data: existingBids, refetch: refetchBids } = api.bid.getForListing.useQuery({ listingId });


  const placeBidMutation = api.bid.create.useMutation({
    onSuccess: () => {
      setBidAmount("");
      refetchBids();
    },
  });

  useEffect(() => {
    if (listingId) {
      joinListingRoom(listingId);
    }
  }, [listingId, joinListingRoom]);

  // Listen for new bids
  useEffect(() => {
    if (!socket) return;

    const handleNewBid = (bidData: any) => {
      setLiveBids(prev => [bidData, ...prev.slice(0, 9)]); // Keep last 10 bids
      refetchBids(); // Refresh the bid list
    };

    socket.on("new-bid", handleNewBid);

    return () => {
      socket.off("new-bid", handleNewBid);
    };
  }, [socket, refetchBids]);

  const handlePlaceBid = async () => {
    if (!session?.user?.id || !bidAmount || !listing) return;

    const amount = parseFloat(bidAmount);
    if (amount <= listing.expectedPrice) {
      alert("Bid must be higher than the minimum price");
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBidMutation.mutateAsync({
        listingId,
        bidAmount: amount,
      });

      
      placeBid({
        listingId,
        bidAmount: amount,
        userId: session.user.id,
      });
    } catch (error) {
      console.error("Failed to place bid:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentHighestBid = existingBids?.[0]?.bidAmount || listing?.expectedPrice || 0;
  const minimumBid = currentHighestBid * 1.01; // 1% higher than current highest

  if (listingLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            {listing?.cropName} - Live Auction
          </CardTitle>
          <CardDescription>
            {listing?.quantity} {listing?.unit} • Quality: {listing?.qualityGrade}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current Highest Bid</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(currentHighestBid)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Minimum Next Bid</div>
              <div className="text-xl font-semibold">
                {formatCurrency(minimumBid)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Time Remaining</div>
              <div className="text-xl font-semibold flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                {listing?.expiresAt ? formatRelativeTime(listing.expiresAt) : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {session?.user?.role === "BUYER" && (
        <Card>
          <CardHeader>
            <CardTitle>Place Your Bid</CardTitle>
            <CardDescription>
              Enter an amount higher than the current minimum bid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Minimum: ${formatCurrency(minimumBid)}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minimumBid}
                step="0.01"
              />
              <Button
                onClick={handlePlaceBid}
                disabled={isSubmitting || !bidAmount || parseFloat(bidAmount) < minimumBid}
              >
                {isSubmitting ? "Placing..." : "Place Bid"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Bid Activity
          </CardTitle>
          <CardDescription>
            Real-time bidding updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Live bids */}
            {liveBids.map((bid, index) => (
              <div key={`live-${index}`} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                <Badge variant="default" className="bg-green-600">LIVE</Badge>
                <div className="flex-1">
                  <div className="font-semibold">New bid placed!</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(bid.bidAmount)} • Just now
                  </div>
                </div>
              </div>
            ))}

            
            {existingBids?.map((bid) => (
              <div key={bid.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={bid.buyer.image || ""} />
                  <AvatarFallback>
                    {bid.buyer.name?.charAt(0) || "B"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">{bid.buyer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(bid.bidAmount)} • {formatRelativeTime(bid.createdAt)}
                  </div>
                </div>
                <Badge variant={bid.status === "ACCEPTED" ? "default" : "secondary"}>
                  {bid.status}
                </Badge>
              </div>
            ))}

            {(!existingBids || existingBids.length === 0) && liveBids.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No bids yet. Be the first to bid!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}