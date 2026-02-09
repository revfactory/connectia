import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const userRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username, deletedAt: null },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          coverImageUrl: true,
          location: true,
          website: true,
          isVerified: true,
          isPrivate: true,
          isOnline: true,
          createdAt: true,
        },
      })
      return user
    }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    })
    return user
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().max(50).optional(),
        bio: z.string().max(500).optional(),
        location: z.string().max(100).optional(),
        website: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      })
      return user
    }),
})
