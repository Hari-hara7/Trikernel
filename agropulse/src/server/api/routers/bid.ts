import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { BidStatus, CropStatus } from "../../../../generated/prisma";

export const bidRouter = createTRPCRouter({
  // Place a bid (Buyer only)
  create: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        bidAmount: z.number().positive("Bid amount must be positive"),
        quantity: z.number().positive("Quantity must be positive"),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "BUYER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only buyers can place bids",
        });
      }

      // Check if listing exists and is active
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.listingId },
        include: { farmer: true },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.status !== CropStatus.ACTIVE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This listing is no longer active",
        });
      }

      if (input.quantity > listing.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Requested quantity exceeds available quantity",
        });
      }

      // Check if buyer already has an active bid on this listing
      const existingBid = await ctx.db.bid.findFirst({
        where: {
          listingId: input.listingId,
          buyerId: ctx.session.user.id,
          status: BidStatus.PENDING,
        },
      });

      if (existingBid) {
        // Update existing bid
        const updated = await ctx.db.bid.update({
          where: { id: existingBid.id },
          data: {
            bidAmount: input.bidAmount,
            quantity: input.quantity,
            totalAmount: input.bidAmount * input.quantity,
            message: input.message,
          },
          include: {
            listing: {
              select: { id: true, cropName: true },
            },
          },
        });

        return updated;
      }

      // Create new bid
      const bid = await ctx.db.bid.create({
        data: {
          listingId: input.listingId,
          buyerId: ctx.session.user.id,
          bidAmount: input.bidAmount,
          quantity: input.quantity,
          totalAmount: input.bidAmount * input.quantity,
          message: input.message,
        },
        include: {
          listing: {
            select: { id: true, cropName: true },
          },
          buyer: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      return bid;
    }),

  // Get all bids for a listing (with real-time updates support)
  getForListing: publicProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const bids = await ctx.db.bid.findMany({
        where: { listingId: input.listingId },
        orderBy: { bidAmount: "desc" },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              image: true,
              city: true,
              state: true,
              avgRating: true,
            },
          },
        },
      });

      return bids;
    }),

  // Get buyer's own bids
  getMyBids: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(BidStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "BUYER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only buyers can view their bids",
        });
      }

      const bids = await ctx.db.bid.findMany({
        where: {
          buyerId: ctx.session.user.id,
          ...(input.status && { status: input.status }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            include: {
              farmer: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  state: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return bids;
    }),

  // Accept a bid (Farmer only)
  accept: protectedProcedure
    .input(z.object({ bidId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bid = await ctx.db.bid.findUnique({
        where: { id: input.bidId },
        include: { listing: true },
      });

      if (!bid) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bid not found",
        });
      }

      if (bid.listing.farmerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only accept bids on your own listings",
        });
      }

      // Update bid status and reject other bids
      await ctx.db.$transaction([
        ctx.db.bid.update({
          where: { id: input.bidId },
          data: { status: BidStatus.ACCEPTED },
        }),
        ctx.db.bid.updateMany({
          where: {
            listingId: bid.listingId,
            id: { not: input.bidId },
            status: BidStatus.PENDING,
          },
          data: { status: BidStatus.REJECTED },
        }),
        ctx.db.cropListing.update({
          where: { id: bid.listingId },
          data: { status: CropStatus.SOLD },
        }),
      ]);

      return { success: true };
    }),

  // Reject a bid (Farmer only)
  reject: protectedProcedure
    .input(z.object({ bidId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bid = await ctx.db.bid.findUnique({
        where: { id: input.bidId },
        include: { listing: true },
      });

      if (!bid) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bid not found",
        });
      }

      if (bid.listing.farmerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only reject bids on your own listings",
        });
      }

      await ctx.db.bid.update({
        where: { id: input.bidId },
        data: { status: BidStatus.REJECTED },
      });

      return { success: true };
    }),

  // Cancel a bid (Buyer only)
  cancel: protectedProcedure
    .input(z.object({ bidId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bid = await ctx.db.bid.findUnique({
        where: { id: input.bidId },
      });

      if (!bid) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bid not found",
        });
      }

      if (bid.buyerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only cancel your own bids",
        });
      }

      if (bid.status !== BidStatus.PENDING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending bids can be cancelled",
        });
      }

      await ctx.db.bid.delete({
        where: { id: input.bidId },
      });

      return { success: true };
    }),

  // Get buyer dashboard stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "BUYER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only buyers can view their stats",
      });
    }

    const [activeBids, acceptedBids, totalSpent] = await Promise.all([
      ctx.db.bid.count({
        where: { buyerId: ctx.session.user.id, status: BidStatus.PENDING },
      }),
      ctx.db.bid.count({
        where: { buyerId: ctx.session.user.id, status: BidStatus.ACCEPTED },
      }),
      ctx.db.bid.aggregate({
        where: { buyerId: ctx.session.user.id, status: BidStatus.ACCEPTED },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      activeBids,
      acceptedBids,
      totalSpent: totalSpent._sum.totalAmount ?? 0,
    };
  }),
});
