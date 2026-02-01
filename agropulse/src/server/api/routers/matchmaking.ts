import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const matchmakingRouter = createTRPCRouter({

  getMatchesForListing: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.listingId },
        include: {
          farmer: {
            select: {
              id: true,
              latitude: true,
              longitude: true,
              state: true,
              city: true,
            },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

    
      const potentialBuyers = await ctx.db.user.findMany({
        where: {
          role: "BUYER",
          OR: [
            { state: listing.farmer.state },
            { city: listing.farmer.city },
          ],
        },
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          trustScore: true,
          avgRating: true,
          latitude: true,
          longitude: true,
          bids: {
            where: {
              listing: {
                category: listing.category,
              },
              status: "ACCEPTED",
            },
            select: {
              totalAmount: true,
            },
          },
        },
        take: 20,
      });

     
      const matches = potentialBuyers.map((buyer) => {
        let score = 0;

        // Location score (0-30)
        if (buyer.city === listing.farmer.city) {
          score += 30;
        } else if (buyer.state === listing.farmer.state) {
          score += 15;
        }

        // Trust score (0-25)
        score += (buyer.trustScore / 100) * 25;

        // Rating score (0-25)
        score += (buyer.avgRating / 5) * 25;

        // Past purchase history (0-20)
        const pastPurchases = buyer.bids.length;
        score += Math.min(pastPurchases * 4, 20);

        return {
          buyer: {
            id: buyer.id,
            name: buyer.name,
            city: buyer.city,
            state: buyer.state,
            avgRating: buyer.avgRating,
          },
          matchScore: Math.round(score),
          reasons: [
            buyer.city === listing.farmer.city
              ? "Same city"
              : buyer.state === listing.farmer.state
              ? "Same state"
              : null,
            buyer.avgRating >= 4 ? "High rating" : null,
            buyer.bids.length > 0 ? "Previous buyer" : null,
          ].filter(Boolean),
        };
      });

      // Sort by match score
      return matches.sort((a, b) => b.matchScore - a.matchScore);
    }),

  
  getRecommendationsForBuyer: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "BUYER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only buyers can get recommendations",
      });
    }

    const buyer = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        state: true,
        city: true,
        bids: {
          where: { status: "ACCEPTED" },
          select: {
            listing: {
              select: { category: true, cropName: true },
            },
          },
          take: 10,
        },
      },
    });

    if (!buyer) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Get categories from past purchases
    const pastCategories = [...new Set(buyer.bids.map((b) => b.listing.category))];
    const pastCrops = [...new Set(buyer.bids.map((b) => b.listing.cropName))];

    // Find recommended listings
    const recommendations = await ctx.db.cropListing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          // Same location
          { farmer: { state: buyer.state } },
          // Same categories as past purchases
          ...(pastCategories.length > 0
            ? [{ category: { in: pastCategories } }]
            : []),
          // Same crops as past purchases
          ...(pastCrops.length > 0
            ? [{ cropName: { in: pastCrops } }]
            : []),
        ],
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            avgRating: true,
            image: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: [
        { farmer: { avgRating: "desc" } },
        { createdAt: "desc" },
      ],
      take: 20,
    });

    // Add recommendation reasons
    return recommendations.map((listing) => ({
      ...listing,
      recommendationReasons: [
        listing.farmer.state === buyer.state ? "Local seller" : null,
        pastCategories.includes(listing.category) ? "Similar to past purchases" : null,
        pastCrops.includes(listing.cropName) ? "Previously bought" : null,
        listing.farmer.avgRating >= 4 ? "Highly rated seller" : null,
      ].filter(Boolean),
    }));
  }),

  // Calculate trust score
  calculateTrustScore: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user's ratings
    const ratings = await ctx.db.rating.aggregate({
      where: { ratedUserId: userId },
      _avg: { rating: true },
      _count: true,
    });

    // Get successful transactions
    const successfulTransactions = await ctx.db.bid.count({
      where: {
        OR: [
          // As buyer
          { buyerId: userId, status: "ACCEPTED" },
          // As farmer (listing owner)
          { listing: { farmerId: userId }, status: "ACCEPTED" },
        ],
      },
    });

    // Calculate trust score (0-100)
    let score = 0;

    // Base score from ratings (0-50)
    if (ratings._count > 0) {
      score += ((ratings._avg.rating ?? 0) / 5) * 50;
    }

    // Score from transactions (0-30)
    score += Math.min(successfulTransactions * 3, 30);

    // Account age bonus (0-20)
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (user) {
      const ageInDays = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.min(ageInDays / 10, 20);
    }

    // Update user's trust score
    await ctx.db.user.update({
      where: { id: userId },
      data: {
        trustScore: Math.round(score),
        avgRating: ratings._avg.rating ?? 0,
        totalRatings: ratings._count,
      },
    });

    return { trustScore: Math.round(score) };
  }),
});
