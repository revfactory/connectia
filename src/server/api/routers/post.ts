import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'

export const postRouter = createTRPCRouter({
  getFeed: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input
      const userId = ctx.session.user.id

      // Get friend IDs
      const friendships = await ctx.db.friendship.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        select: { requesterId: true, addresseeId: true },
      })

      const friendIds = friendships.map((f) =>
        f.requesterId === userId ? f.addresseeId : f.requesterId
      )

      const posts = await ctx.db.post.findMany({
        where: {
          deletedAt: null,
          OR: [
            { authorId: userId },
            { authorId: { in: friendIds }, audience: { in: ['PUBLIC', 'FRIENDS'] } },
            { audience: 'PUBLIC' },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          _count: { select: { comments: true } },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
      }

      return { posts, nextCursor }
    }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().max(10000).optional(),
        type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'LINK', 'SHARED']).default('TEXT'),
        audience: z.enum(['PUBLIC', 'FRIENDS', 'ONLY_ME', 'CUSTOM']).default('PUBLIC'),
        mediaUrls: z.array(z.any()).default([]),
        feeling: z.string().max(50).optional(),
        location: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.create({
        data: {
          ...input,
          authorId: ctx.session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
        },
      })
      return post
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } })
      if (!post || post.authorId !== ctx.session.user.id) {
        throw new Error('Unauthorized')
      }
      await ctx.db.post.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      })
      return { success: true }
    }),
})
