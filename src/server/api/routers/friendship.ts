import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const friendshipRouter = createTRPCRouter({
  sendRequest: protectedProcedure
    .input(z.object({ addresseeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      if (userId === input.addresseeId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '자신에게 친구 요청을 보낼 수 없습니다.' })
      }

      const existing = await ctx.db.friendship.findFirst({
        where: {
          OR: [
            { requesterId: userId, addresseeId: input.addresseeId },
            { requesterId: input.addresseeId, addresseeId: userId },
          ],
        },
      })

      if (existing) {
        if (existing.status === 'BLOCKED') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '차단된 사용자입니다.' })
        }
        throw new TRPCError({ code: 'CONFLICT', message: '이미 친구 요청이 존재합니다.' })
      }

      return ctx.db.friendship.create({
        data: { requesterId: userId, addresseeId: input.addresseeId },
      })
    }),

  acceptRequest: protectedProcedure
    .input(z.object({ friendshipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db.friendship.findUnique({
        where: { id: input.friendshipId },
      })
      if (!friendship || friendship.addresseeId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return ctx.db.friendship.update({
        where: { id: input.friendshipId },
        data: { status: 'ACCEPTED' },
      })
    }),

  declineRequest: protectedProcedure
    .input(z.object({ friendshipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db.friendship.findUnique({
        where: { id: input.friendshipId },
      })
      if (!friendship || friendship.addresseeId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return ctx.db.friendship.update({
        where: { id: input.friendshipId },
        data: { status: 'DECLINED' },
      })
    }),

  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const friendships = await ctx.db.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, isOnline: true },
        },
        addressee: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, isOnline: true },
        },
      },
    })
    return friendships.map((f) => ({
      friendship: f,
      friend: f.requesterId === userId ? f.addressee : f.requester,
    }))
  }),

  getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.friendship.findMany({
      where: { addresseeId: ctx.session.user.id, status: 'PENDING' },
      include: {
        requester: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),
})
