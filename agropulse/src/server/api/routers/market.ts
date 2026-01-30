import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const marketRouter = createTRPCRouter({
  // Get mandi prices
  getMandiPrices: publicProcedure
    .input(
      z.object({
        cropName: z.string().optional(),
        state: z.string().optional(),
        district: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const prices = await ctx.db.mandiPrice.findMany({
        where: {
          ...(input.cropName && { 
            cropName: { contains: input.cropName, mode: "insensitive" as const } 
          }),
          ...(input.state && { state: input.state }),
          ...(input.district && { district: input.district }),
        },
        orderBy: { priceDate: "desc" },
        take: input.limit,
      });

      return prices;
    }),

  // Get AI predictions
  getAIPredictions: publicProcedure
    .input(
      z.object({
        cropName: z.string(),
        state: z.string(),
        district: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // First check cache
      const cached = await ctx.db.aIPrediction.findFirst({
        where: {
          cropName: { equals: input.cropName, mode: "insensitive" as const },
          state: input.state,
          validUntil: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (cached) {
        return cached;
      }

      // Return null if no cached prediction - AI service will be called separately
      return null;
    }),

  // Store AI prediction (internal use)
  storeAIPrediction: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        state: z.string(),
        district: z.string().optional(),
        predictedPrice: z.number(),
        confidence: z.number(),
        sellTimeSuggestion: z.string().optional(),
        factors: z.any().optional(),
        validUntil: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prediction = await ctx.db.aIPrediction.create({
        data: input,
      });

      return prediction;
    }),

  // Get price comparison for a crop
  getPriceComparison: publicProcedure
    .input(
      z.object({
        cropName: z.string(),
        state: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get average prices by state
      const pricesByState = await ctx.db.mandiPrice.groupBy({
        by: ["state"],
        where: {
          cropName: { equals: input.cropName, mode: "insensitive" as const },
          priceDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
        _avg: {
          modalPrice: true,
          minPrice: true,
          maxPrice: true,
        },
        _count: true,
      });

      // Get current listings average price
      const listingAvg = await ctx.db.cropListing.aggregate({
        where: {
          cropName: { equals: input.cropName, mode: "insensitive" as const },
          status: "ACTIVE",
        },
        _avg: {
          expectedPrice: true,
        },
        _count: true,
      });

      return {
        mandiPrices: pricesByState,
        listingAverage: listingAvg,
      };
    }),

  // Get trending crops
  getTrendingCrops: publicProcedure.query(async ({ ctx }) => {
    const trending = await ctx.db.cropListing.groupBy({
      by: ["cropName", "category"],
      where: {
        status: "ACTIVE",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _count: true,
      _avg: {
        expectedPrice: true,
      },
      orderBy: {
        _count: {
          cropName: "desc",
        },
      },
      take: 10,
    });

    return trending;
  }),

  // Get states with active listings
  getActiveStates: publicProcedure.query(async ({ ctx }) => {
    const states = await ctx.db.user.groupBy({
      by: ["state"],
      where: {
        role: "FARMER",
        cropListings: {
          some: { status: "ACTIVE" },
        },
        state: { not: null },
      },
      _count: true,
    });

    return states.filter((s) => s.state);
  }),

  // Seed mandi prices (for demo)
  seedMandiPrices: protectedProcedure.mutation(async ({ ctx }) => {
    const crops = [
      { name: "Wheat", category: "GRAINS" },
      { name: "Rice", category: "GRAINS" },
      { name: "Tomato", category: "VEGETABLES" },
      { name: "Potato", category: "VEGETABLES" },
      { name: "Onion", category: "VEGETABLES" },
      { name: "Apple", category: "FRUITS" },
      { name: "Mango", category: "FRUITS" },
    ];

    const states = [
      { state: "Maharashtra", districts: ["Pune", "Mumbai", "Nagpur"] },
      { state: "Punjab", districts: ["Ludhiana", "Amritsar", "Jalandhar"] },
      { state: "Uttar Pradesh", districts: ["Lucknow", "Kanpur", "Agra"] },
      { state: "Karnataka", districts: ["Bangalore", "Mysore", "Hubli"] },
    ];

    const prices = [];

    for (const crop of crops) {
      for (const stateData of states) {
        for (const district of stateData.districts) {
          const basePrice = Math.floor(Math.random() * 3000) + 1000;
          prices.push({
            cropName: crop.name,
            mandiName: `${district} Mandi`,
            state: stateData.state,
            district,
            minPrice: basePrice * 0.8,
            maxPrice: basePrice * 1.2,
            modalPrice: basePrice,
            priceDate: new Date(),
          });
        }
      }
    }

    await ctx.db.mandiPrice.createMany({
      data: prices,
      skipDuplicates: true,
    });

    return { success: true, count: prices.length };
  }),
});
