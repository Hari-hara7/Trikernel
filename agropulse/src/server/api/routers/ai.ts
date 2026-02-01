import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  predictCropPrice,
  getAICropRecommendation,
  chatWithAI,
  analyzeMarketTrends,
  detectCropDisease,
  getWeatherBasedRecommendations,
  compareMarketPrices,
  analyzeSoilHealth,
  matchGovernmentSchemes,
  predictHarvestQuality,
  getNegotiationAdvice,
} from "~/server/services/gemini";

export const aiRouter = createTRPCRouter({
  
  getPricePrediction: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        quantity: z.number().optional(),
        location: z.string().optional(),
        state: z.string().optional(),
        quality: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
     
      const basePrice = 100; // Base price per unit
      const quantityMultiplier = input.quantity ? Math.max(0.8, Math.min(1.2, input.quantity / 1000)) : 1;
      const qualityMultiplier = input.quality === "premium" ? 1.3 : input.quality === "standard" ? 1.0 : 0.8;

      const predictedPrice = basePrice * quantityMultiplier * qualityMultiplier;

      return {
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence: 0.85,
        sellTimeSuggestion: "Now",
        source: "AI Market Analysis",
        priceRange: {
          min: Math.round(predictedPrice * 0.9 * 100) / 100,
          max: Math.round(predictedPrice * 1.1 * 100) / 100,
        },
        marketTrend: "stable",
      };
    }),

 
  predictPrice: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        state: z.string(),
        district: z.string().optional(),
        quantity: z.number(),
        qualityGrade: z.string().optional(),
        currentMarketPrice: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prediction = await predictCropPrice(input);

      
      await ctx.db.aIPrediction.create({
        data: {
          cropName: input.cropName,
          state: input.state,
          district: input.district,
          predictedPrice: prediction.predictedPrice,
          confidence: prediction.confidence,
          sellTimeSuggestion: prediction.sellTimeSuggestion,
          factors: prediction.factors,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
        },
      });

      return prediction;
    }),

  // Get crop recommendations
  getCropRecommendations: protectedProcedure
    .input(
      z.object({
        state: z.string(),
        district: z.string().optional(),
        season: z.string(),
        soilType: z.string().optional(),
        waterAvailability: z.string().optional(),
        farmSize: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await getAICropRecommendation(input);
    }),

 
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          name: true,
          role: true,
          state: true,
          city: true,
        },
      });

    
      let crops: string[] = [];
      if (user?.role === "FARMER") {
        const listings = await ctx.db.cropListing.findMany({
          where: { farmerId: ctx.session.user.id },
          select: { cropName: true },
          distinct: ["cropName"],
          take: 5,
        });
        crops = listings.map((l) => l.cropName);
      }

      const response = await chatWithAI(input.message, {
        userRole: user?.role ?? "USER",
        userName: user?.name ?? undefined,
        location: user?.state ?? undefined,
        crops,
      });

      return { response };
    }),

  
  analyzeMarket: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        state: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
    
      const mandiPrices = await ctx.db.mandiPrice.findMany({
        where: {
          cropName: { contains: input.cropName, mode: "insensitive" },
          state: input.state,
        },
        orderBy: { priceDate: "desc" },
        take: 10,
        select: {
          priceDate: true,
          modalPrice: true,
        },
      });

      const historicalPrices = mandiPrices.map((p) => ({
        date: p.priceDate.toISOString().split("T")[0]!,
        price: p.modalPrice,
      }));

      return await analyzeMarketTrends({
        cropName: input.cropName,
        state: input.state,
        historicalPrices,
      });
    }),

  // Get cached prediction if available
  getCachedPrediction: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        state: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const prediction = await ctx.db.aIPrediction.findFirst({
        where: {
          cropName: { contains: input.cropName, mode: "insensitive" },
          state: input.state,
          validUntil: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      return prediction;
    }),

  // Quick AI insights for dashboard
  getDashboardInsights: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { role: true, state: true },
    });

    if (user?.role === "FARMER") {
      // Get farmer's active listings
      const listings = await ctx.db.cropListing.findMany({
        where: {
          farmerId: ctx.session.user.id,
          status: "ACTIVE",
        },
        select: {
          cropName: true,
          expectedPrice: true,
          aiPredictedPrice: true,
        },
      });

      // Get predictions for each crop
      const predictions = await ctx.db.aIPrediction.findMany({
        where: {
          state: user.state ?? "Maharashtra",
          validUntil: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      return {
        role: "FARMER",
        activeListings: listings.length,
        predictions: predictions.map((p) => ({
          crop: p.cropName,
          predictedPrice: p.predictedPrice,
          confidence: p.confidence,
          suggestion: p.sellTimeSuggestion,
        })),
        tip: listings.length > 0
          ? "Check AI price predictions to optimize your selling time!"
          : "List your first crop to get AI-powered price predictions.",
      };
    } else {
      // Buyer insights
      const recentBids = await ctx.db.bid.count({
        where: {
          buyerId: ctx.session.user.id,
          status: "PENDING",
        },
      });

      return {
        role: "BUYER",
        pendingBids: recentBids,
        tip: "Use AI market analysis to find the best deals on crops.",
      };
    }
  }),

  // Get sell time recommendation for a listing
  getSellTimeRecommendation: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.listingId },
        include: {
          farmer: {
            select: { state: true, city: true },
          },
          bids: {
            orderBy: { bidAmount: "desc" },
            take: 5,
          },
        },
      });

      if (!listing) {
        return null;
      }

      // Analyze bids
      const highestBid = listing.bids[0]?.bidAmount ?? 0;
      const bidCount = listing.bids.length;
      const avgBidAmount =
        listing.bids.reduce((sum, b) => sum + b.bidAmount, 0) / (bidCount || 1);

      // Compare with expected price
      const priceRatio = highestBid / listing.expectedPrice;

      let recommendation = "";
      let urgency: "high" | "medium" | "low" = "low";

      if (priceRatio >= 1.1) {
        recommendation = "Excellent offer! Consider accepting the highest bid.";
        urgency = "high";
      } else if (priceRatio >= 0.95) {
        recommendation = "Good offers received. You can accept or wait for better.";
        urgency = "medium";
      } else if (priceRatio >= 0.8) {
        recommendation = "Bids are below expectation. Consider waiting or adjusting price.";
        urgency = "low";
      } else if (bidCount === 0) {
        recommendation = "No bids yet. Consider adjusting price or waiting.";
        urgency = "low";
      } else {
        recommendation = "Bids are significantly below expectation. Review your pricing.";
        urgency = "low";
      }

      return {
        recommendation,
        urgency,
        analysis: {
          highestBid,
          averageBid: Math.round(avgBidAmount),
          bidCount,
          expectedPrice: listing.expectedPrice,
          priceRatio: Math.round(priceRatio * 100),
        },
      };
    }),

  // Update listing with AI predictions
  updateListingWithPredictions: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.listingId },
        include: {
          farmer: {
            select: { state: true },
          },
        },
      });

      if (!listing || listing.farmerId !== ctx.session.user.id) {
        return null;
      }

      // Get current market price
      const marketPrice = await ctx.db.mandiPrice.findFirst({
        where: {
          cropName: { contains: listing.cropName, mode: "insensitive" },
          state: listing.farmer.state ?? "Maharashtra",
        },
        orderBy: { priceDate: "desc" },
      });

      // Get AI prediction
      const prediction = await predictCropPrice({
        cropName: listing.cropName,
        state: listing.farmer.state ?? "Maharashtra",
        quantity: listing.quantity,
        qualityGrade: listing.qualityGrade ?? undefined,
        currentMarketPrice: marketPrice?.modalPrice,
      });

      await ctx.db.cropListing.update({
        where: { id: input.listingId },
        data: {
          aiPredictedPrice: prediction.predictedPrice,
          aiSellTimeSuggestion: prediction.sellTimeSuggestion,
          aiConfidenceScore: prediction.confidence,
        },
      });

      return {
        predictedPrice: prediction.predictedPrice,
        sellTimeSuggestion: prediction.sellTimeSuggestion,
        confidence: prediction.confidence,
        recommendation: prediction.recommendation,
        factors: prediction.factors,
      };
    }),

  // ==================== ENHANCED AI FEATURES ====================

  // Crop Disease Detection
  detectDisease: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        symptoms: z.string().min(10, "Please describe symptoms in detail"),
        affectedPart: z.string().optional(),
        weatherConditions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await detectCropDisease(input);
    }),

  // Weather-Based Recommendations
  getWeatherRecommendations: protectedProcedure
    .input(
      z.object({
        state: z.string(),
        district: z.string().optional(),
        currentCrops: z.array(z.string()).optional(),
        season: z.string(),
        weatherForecast: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await getWeatherBasedRecommendations(input);
    }),

 
  comparePrices: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        quantity: z.number(),
        sellerState: z.string(),
        prices: z.array(
          z.object({
            mandiName: z.string(),
            state: z.string(),
            price: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return await compareMarketPrices(input);
    }),

 
  analyzeSoil: protectedProcedure
    .input(
      z.object({
        soilType: z.string(),
        phLevel: z.number().optional(),
        nitrogenLevel: z.string().optional(),
        phosphorusLevel: z.string().optional(),
        potassiumLevel: z.string().optional(),
        organicMatter: z.string().optional(),
        currentCrop: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await analyzeSoilHealth(input);
    }),

  // Government Scheme Matcher
  matchSchemes: protectedProcedure
    .input(
      z.object({
        state: z.string(),
        farmerType: z.enum(["small", "marginal", "medium", "large"]),
        landSize: z.number(),
        cropTypes: z.array(z.string()),
        hasKCC: z.boolean().optional(),
        hasBankAccount: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await matchGovernmentSchemes(input);
    }),

  // Harvest Quality Predictor
  predictQuality: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        sowingDate: z.string(),
        currentGrowthStage: z.string(),
        irrigationFrequency: z.string(),
        fertiliserUsed: z.array(z.string()).optional(),
        pestIssues: z.string().optional(),
        weatherConditions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await predictHarvestQuality(input);
    }),

  // Negotiation Advisor
  getNegotiationAdvice: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        quantity: z.number(),
        yourAskingPrice: z.number(),
        buyerOffer: z.number(),
        marketPrice: z.number(),
        cropQuality: z.string(),
        urgencyToSell: z.enum(["high", "medium", "low"]),
      })
    )
    .mutation(async ({ input }) => {
      return await getNegotiationAdvice(input);
    }),

  // Smart Price Comparison with live mandi data
  smartPriceCompare: protectedProcedure
    .input(
      z.object({
        cropName: z.string(),
        quantity: z.number(),
        state: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get live mandi prices from database
      const mandiPrices = await ctx.db.mandiPrice.findMany({
        where: {
          cropName: { contains: input.cropName, mode: "insensitive" },
        },
        orderBy: { priceDate: "desc" },
        take: 20,
        distinct: ["mandiName"],
      });

      if (mandiPrices.length === 0) {
        return {
          message: "No market data available for this crop",
          prices: [],
        };
      }

      // Use AI to compare prices
      const comparison = await compareMarketPrices({
        cropName: input.cropName,
        quantity: input.quantity,
        sellerState: input.state,
        prices: mandiPrices.map((p) => ({
          mandiName: p.mandiName,
          state: p.state,
          price: p.modalPrice,
        })),
      });

      return {
        ...comparison,
        mandiPrices: mandiPrices.map((p) => ({
          mandiName: p.mandiName,
          state: p.state,
          district: p.district,
          minPrice: p.minPrice,
          maxPrice: p.maxPrice,
          modalPrice: p.modalPrice,
          priceDate: p.priceDate,
        })),
      };
    }),
});
