import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { CropCategory, CropStatus } from "../../../../generated/prisma";

export const cropRouter = createTRPCRouter({
 
  create: protectedProcedure
    .input(
      z.object({
        cropName: z.string().min(1, "Crop name is required"),
        category: z.nativeEnum(CropCategory),
        quantity: z.number().positive("Quantity must be positive"),
        unit: z.string().default("quintal"),
        expectedPrice: z.number().positive("Price must be positive"),
        minPrice: z.number().positive().optional(),
        description: z.string().optional(),
        qualityGrade: z.string().optional(),
        isCertified: z.boolean().default(false),
        certifications: z.array(z.string()).default([]),
        images: z.array(z.string()).default([]),
        harvestLocation: z.string().optional(),
        harvestDate: z.date().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "FARMER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only farmers can create crop listings",
        });
      }

      const listing = await ctx.db.cropListing.create({
        data: {
          ...input,
          farmerId: ctx.session.user.id,
        },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              avgRating: true,
            },
          },
        },
      });

      return listing;
    }),

  
  getAll: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(CropCategory).optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        state: z.string().optional(),
        sortBy: z.enum(["price_asc", "price_desc", "newest", "quantity"]).default("newest"),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { category, search, minPrice, maxPrice, state, sortBy, limit, cursor } = input;

      const where = {
        status: CropStatus.ACTIVE,
        ...(category && { category }),
        ...(search && {
          OR: [
            { cropName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(minPrice && { expectedPrice: { gte: minPrice } }),
        ...(maxPrice && { expectedPrice: { lte: maxPrice } }),
        ...(state && { farmer: { state } }),
      };

      const orderBy = {
        price_asc: { expectedPrice: "asc" as const },
        price_desc: { expectedPrice: "desc" as const },
        newest: { createdAt: "desc" as const },
        quantity: { quantity: "desc" as const },
      }[sortBy];

      const listings = await ctx.db.cropListing.findMany({
        where,
        orderBy,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
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
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (listings.length > limit) {
        const nextItem = listings.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: listings,
        nextCursor,
      };
    }),

 
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.id },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true,
              state: true,
              avgRating: true,
              totalRatings: true,
              image: true,
            },
          },
          bids: {
            orderBy: { bidAmount: "desc" },
            take: 10,
            include: {
              buyer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: { bids: true },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      return listing;
    }),

  getMyListings: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(CropStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "FARMER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only farmers can view their listings",
        });
      }

      const listings = await ctx.db.cropListing.findMany({
        where: {
          farmerId: ctx.session.user.id,
          ...(input.status && { status: input.status }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          bids: {
            orderBy: { bidAmount: "desc" },
            take: 5,
            include: {
              buyer: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
          _count: {
            select: { bids: true },
          },
        },
      });

      return listings;
    }),

  
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(CropStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.farmerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own listings",
        });
      }

      const updated = await ctx.db.cropListing.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      return updated;
    }),

 
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().positive().optional(),
        expectedPrice: z.number().positive().optional(),
        minPrice: z.number().positive().optional(),
        description: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.farmerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own listings",
        });
      }

      const { id, ...updateData } = input;
      const updated = await ctx.db.cropListing.update({
        where: { id },
        data: updateData,
      });

      return updated;
    }),


  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.cropListing.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.farmerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own listings",
        });
      }

      await ctx.db.cropListing.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "FARMER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only farmers can view their stats",
      });
    }

    const [activeListings, totalBids, soldListings] = await Promise.all([
      ctx.db.cropListing.count({
        where: { farmerId: ctx.session.user.id, status: CropStatus.ACTIVE },
      }),
      ctx.db.bid.count({
        where: { listing: { farmerId: ctx.session.user.id } },
      }),
      ctx.db.cropListing.count({
        where: { farmerId: ctx.session.user.id, status: CropStatus.SOLD },
      }),
    ]);

    const recentBids = await ctx.db.bid.findMany({
      where: { listing: { farmerId: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        listing: {
          select: { id: true, cropName: true },
        },
        buyer: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return {
      activeListings,
      totalBids,
      soldListings,
      recentBids,
    };
  }),
});
