import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PrismaClient } from "../../../../generated/prisma";


type NotificationType = 
  | "BID_RECEIVED"
  | "BID_ACCEPTED"
  | "BID_REJECTED"
  | "MESSAGE_RECEIVED"
  | "PRICE_ALERT"
  | "LISTING_EXPIRED"
  | "PAYMENT_RECEIVED"
  | "SYSTEM";


export async function createNotification(
  db: PrismaClient,
  params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    data?: Record<string, unknown>;
  }
) {
  return await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      data: params.data as any,
    },
  });
}

export const notificationRouter = createTRPCRouter({

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.db.notification.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined = undefined;
      if (notifications.length > input.limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem!.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

 
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
    });

    return count;
  }),


  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification || notification.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });

      return { success: true };
    }),

  
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }),

  
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification || notification.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await ctx.db.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.deleteMany({
      where: {
        userId: ctx.session.user.id,
        isRead: true,
      },
    });

    return { success: true };
  }),

  getRecent: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await ctx.db.notification.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const unreadCount = await ctx.db.notification.count({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
    });

    return {
      notifications,
      unreadCount,
    };
  }),


  createTest: protectedProcedure
    .input(z.object({
      type: z.enum([
        "BID_RECEIVED",
        "BID_ACCEPTED",
        "BID_REJECTED",
        "MESSAGE_RECEIVED",
        "PRICE_ALERT",
        "LISTING_EXPIRED",
        "PAYMENT_RECEIVED",
        "SYSTEM"
      ]).default("SYSTEM"),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      const type = input?.type ?? "SYSTEM";
      
      const notificationData: Record<string, { title: string; message: string; link?: string }> = {
        BID_RECEIVED: {
          title: "New Bid Received!",
          message: "A buyer placed a bid of ₹2,500/quintal on your Rice listing.",
          link: "/dashboard",
        },
        BID_ACCEPTED: {
          title: "Bid Accepted! 🎉",
          message: "Your bid for Wheat has been accepted. Proceed with the transaction.",
          link: "/dashboard/my-bids",
        },
        BID_REJECTED: {
          title: "Bid Not Accepted",
          message: "Your bid for Cotton was not accepted. Try other listings!",
          link: "/dashboard/browse",
        },
        MESSAGE_RECEIVED: {
          title: "New Message",
          message: "Farmer Rajesh: Hello, I am interested in your offer...",
          link: "/dashboard/messages",
        },
        PRICE_ALERT: {
          title: "Price Alert 📈",
          message: "Rice prices are up! Current rate: ₹2,800/quintal in your region.",
          link: "/dashboard/market",
        },
        LISTING_EXPIRED: {
          title: "Listing Expired",
          message: "Your Wheat listing has expired. Renew it to continue receiving bids.",
          link: "/dashboard",
        },
        PAYMENT_RECEIVED: {
          title: "Payment Received! 💰",
          message: "₹50,000 has been credited to your account for the Cotton sale.",
          link: "/dashboard",
        },
        SYSTEM: {
          title: "Welcome to AgroPulse!",
          message: "Your account is ready. Start listing your crops or browse available produce.",
          link: "/dashboard",
        },
      };

      const data = (notificationData[type] ?? notificationData.SYSTEM)!;

      return createNotification(ctx.db, {
        userId: ctx.session.user.id,
        type: type as NotificationType,
        title: data.title,
        message: data.message,
        link: data.link,
      });
    }),
});

// Helper functions to create specific notification types
export const NotificationService = {
  async bidReceived(
    db: PrismaClient,
    farmerId: string,
    bidderName: string,
    cropName: string,
    bidAmount: number,
    listingId: string
  ) {
    return createNotification(db, {
      userId: farmerId,
      type: "BID_RECEIVED",
      title: "New Bid Received!",
      message: `${bidderName} placed a bid of ₹${bidAmount}/quintal on your ${cropName} listing.`,
      link: `/dashboard/listings/${listingId}`,
      data: { bidAmount, cropName },
    });
  },

  async bidAccepted(
    db: PrismaClient,
    buyerId: string,
    farmerName: string,
    cropName: string,
    bidAmount: number,
    listingId: string
  ) {
    return createNotification(db, {
      userId: buyerId,
      type: "BID_ACCEPTED",
      title: "Bid Accepted! 🎉",
      message: `${farmerName} accepted your bid of ₹${bidAmount}/quintal for ${cropName}.`,
      link: `/dashboard/my-bids`,
      data: { bidAmount, cropName, listingId },
    });
  },

  async bidRejected(
    db: PrismaClient,
    buyerId: string,
    farmerName: string,
    cropName: string
  ) {
    return createNotification(db, {
      userId: buyerId,
      type: "BID_REJECTED",
      title: "Bid Not Accepted",
      message: `${farmerName} did not accept your bid for ${cropName}. Try browsing other listings!`,
      link: `/dashboard/browse`,
      data: { cropName },
    });
  },

  async newMessage(
    db: PrismaClient,
    receiverId: string,
    senderName: string,
    messagePreview: string
  ) {
    return createNotification(db, {
      userId: receiverId,
      type: "MESSAGE_RECEIVED",
      title: "New Message",
      message: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? "..." : ""}`,
      link: `/dashboard/messages`,
    });
  },

  async priceAlert(
    db: PrismaClient,
    userId: string,
    cropName: string,
    priceChange: string,
    newPrice: number
  ) {
    return createNotification(db, {
      userId,
      type: "PRICE_ALERT",
      title: "Price Alert 📈",
      message: `${cropName} prices ${priceChange}! Current rate: ₹${newPrice}/quintal.`,
      link: `/dashboard/market`,
      data: { cropName, newPrice },
    });
  },

  async listingExpired(
    db: PrismaClient,
    farmerId: string,
    cropName: string,
    listingId: string
  ) {
    return createNotification(db, {
      userId: farmerId,
      type: "LISTING_EXPIRED",
      title: "Listing Expired",
      message: `Your ${cropName} listing has expired. Renew it to continue receiving bids.`,
      link: `/dashboard/listings/${listingId}`,
      data: { cropName, listingId },
    });
  },

  async systemNotification(
    db: PrismaClient,
    userId: string,
    title: string,
    message: string,
    link?: string
  ) {
    return createNotification(db, {
      userId,
      type: "SYSTEM",
      title,
      message,
      link,
    });
  },
};
