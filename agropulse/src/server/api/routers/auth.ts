import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import {
  generateTwoFactorSecret,
  generateTwoFactorQRCode,
  verifyTwoFactorToken,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
} from "~/lib/two-factor";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().optional(),
        role: z.enum(["FARMER", "BUYER"]),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          phone: input.phone,
          role: input.role,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          address: input.address,
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        latitude: true,
        longitude: true,
        trustScore: true,
        totalRatings: true,
        avgRating: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),

  // ==================== TWO-FACTOR AUTHENTICATION ====================

  // Get 2FA status
  getTwoFactorStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { twoFactorEnabled: true },
    });

    return {
      enabled: user?.twoFactorEnabled ?? false,
    };
  }),

  // Generate 2FA setup (secret + QR code)
  setupTwoFactor: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.twoFactorEnabled) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Two-factor authentication is already enabled",
      });
    }

    // Generate new secret
    const secret = generateTwoFactorSecret();

    // Generate QR code
    const qrCode = await generateTwoFactorQRCode(user.email, secret);

    // Store the secret temporarily (not enabled yet)
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      qrCode,
    };
  }),

  // Verify and enable 2FA
  enableTwoFactor: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6, "Token must be 6 digits"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { twoFactorSecret: true, twoFactorEnabled: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.twoFactorEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Two-factor authentication is already enabled",
        });
      }

      if (!user.twoFactorSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please set up two-factor authentication first",
        });
      }

      // Verify the token
      const isValid = verifyTwoFactorToken(input.token, user.twoFactorSecret);

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Generate backup codes
      const backupCodes = generateBackupCodes(10);
      const hashedBackupCodes = await hashBackupCodes(backupCodes);

      // Enable 2FA
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          twoFactorEnabled: true,
        },
      });

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "TWO_FACTOR_ENABLED",
          details: {},
        },
      });

      return {
        success: true,
        backupCodes, // Return backup codes only once
      };
    }),

  // Disable 2FA
  disableTwoFactor: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6, "Token must be 6 digits"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { 
          password: true, 
          twoFactorSecret: true, 
          twoFactorEnabled: true 
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (!user.twoFactorEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Two-factor authentication is not enabled",
        });
      }

      // Verify password
      if (!user.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot disable 2FA for OAuth accounts",
        });
      }

      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      // Verify the token
      if (!user.twoFactorSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "2FA secret not found",
        });
      }

      const isValid = verifyTwoFactorToken(input.token, user.twoFactorSecret);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Disable 2FA
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "TWO_FACTOR_DISABLED",
          details: {},
        },
      });

      return { success: true };
    }),

  // Verify 2FA token during login (called from login page)
  verifyTwoFactorLogin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string().min(6, "Token is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: {
          id: true,
          twoFactorSecret: true,
          twoFactorEnabled: true,
        },
      });

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid request",
        });
      }

      const isValid = verifyTwoFactorToken(input.token, user.twoFactorSecret);

      if (!isValid) {
        // Log failed 2FA attempt
        await ctx.db.auditLog.create({
          data: {
            userId: user.id,
            action: "TWO_FACTOR_FAILED",
            details: {},
          },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Log successful 2FA verification
      await ctx.db.auditLog.create({
        data: {
          userId: user.id,
          action: "TWO_FACTOR_VERIFIED",
          details: {},
        },
      });

      return { success: true, userId: user.id };
    }),

  // Check if user has 2FA enabled (for login flow)
  checkTwoFactorRequired: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { twoFactorEnabled: true },
      });

      return {
        required: user?.twoFactorEnabled ?? false,
      };
    }),
});
