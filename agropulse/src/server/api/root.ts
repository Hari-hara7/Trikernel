import { authRouter } from "~/server/api/routers/auth";
import { cropRouter } from "~/server/api/routers/crop";
import { bidRouter } from "~/server/api/routers/bid";
import { marketRouter } from "~/server/api/routers/market";
import { matchmakingRouter } from "~/server/api/routers/matchmaking";
import { messageRouter } from "~/server/api/routers/message";
import { aiRouter } from "~/server/api/routers/ai";
import { notificationRouter } from "~/server/api/routers/notification";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  crop: cropRouter,
  bid: bidRouter,
  market: marketRouter,
  matchmaking: matchmakingRouter,
  message: messageRouter,
  ai: aiRouter,
  notification: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
