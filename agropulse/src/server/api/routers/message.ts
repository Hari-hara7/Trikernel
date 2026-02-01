import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const messageRouter = createTRPCRouter({
 
  send: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        content: z.string().min(1, "Message cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.receiverId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot send a message to yourself",
        });
      }

      const receiver = await ctx.db.user.findUnique({
        where: { id: input.receiverId },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const message = await ctx.db.message.create({
        data: {
          senderId: ctx.session.user.id,
          receiverId: input.receiverId,
          content: input.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return message;
    }),

 
  getConversation: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.message.findMany({
        where: {
          OR: [
            { senderId: ctx.session.user.id, receiverId: input.userId },
            { senderId: input.userId, receiverId: ctx.session.user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem!.id;
      }

      
      await ctx.db.message.updateMany({
        where: {
          senderId: input.userId,
          receiverId: ctx.session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      return {
        messages: messages.reverse(),
        nextCursor,
      };
    }),

 
  getInbox: protectedProcedure.query(async ({ ctx }) => {
    
    const sentMessages = await ctx.db.message.findMany({
      where: { senderId: ctx.session.user.id },
      distinct: ["receiverId"],
      orderBy: { createdAt: "desc" },
      select: {
        receiverId: true,
        content: true,
        createdAt: true,
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    const receivedMessages = await ctx.db.message.findMany({
      where: { receiverId: ctx.session.user.id },
      distinct: ["senderId"],
      orderBy: { createdAt: "desc" },
      select: {
        senderId: true,
        content: true,
        createdAt: true,
        isRead: true,
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Combine and deduplicate
    const conversationsMap = new Map<
      string,
      {
        user: { id: string; name: string | null; image: string | null; role: string };
        lastMessage: string;
        lastMessageAt: Date;
        unread: boolean;
      }
    >();

    for (const msg of sentMessages) {
      conversationsMap.set(msg.receiverId, {
        user: msg.receiver,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unread: false,
      });
    }

    for (const msg of receivedMessages) {
      const existing = conversationsMap.get(msg.senderId);
      if (!existing || msg.createdAt > existing.lastMessageAt) {
        conversationsMap.set(msg.senderId, {
          user: msg.sender,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unread: !msg.isRead,
        });
      }
    }

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );

    return conversations;
  }),

  // Get unread message count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.message.count({
      where: {
        receiverId: ctx.session.user.id,
        isRead: false,
      },
    });

    return count;
  }),

  // Search users to start a new conversation
  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: {
          AND: [
            { id: { not: ctx.session.user.id } }, // Exclude self
            {
              OR: [
                { name: { contains: input.query, mode: "insensitive" } },
                { email: { contains: input.query, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          city: true,
          state: true,
        },
        take: 10,
      });

      return users;
    }),

  // Get users the current user has interacted with (for quick access)
  getRecentContacts: protectedProcedure.query(async ({ ctx }) => {
    // Find users from bid interactions
    const userRole = ctx.session.user.role;

    if (userRole === "FARMER") {
      // Farmers see buyers who bid on their listings
      const bidders = await ctx.db.bid.findMany({
        where: {
          listing: { farmerId: ctx.session.user.id },
        },
        select: {
          buyer: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              city: true,
              state: true,
            },
          },
        },
        distinct: ["buyerId"],
        take: 20,
      });

      return bidders.map((b) => b.buyer);
    } else {
      // Buyers see farmers they've interacted with
      const farmers = await ctx.db.cropListing.findMany({
        where: {
          bids: { some: { buyerId: ctx.session.user.id } },
        },
        select: {
          farmer: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              city: true,
              state: true,
            },
          },
        },
        distinct: ["farmerId"],
        take: 20,
      });

      return farmers.map((f) => f.farmer);
    }
  }),
});
