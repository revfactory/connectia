import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const notificationRouter = createTRPCRouter({
  getNotifications: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const notifications = await ctx.db.notification.findMany({
        where: {
          recipientId: userId,
          ...(input.unreadOnly ? { isRead: false } : {}),
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      })

      let nextCursor: string | undefined
      if (notifications.length > input.limit) {
        const nextItem = notifications.pop()
        nextCursor = nextItem?.id
      }

      return {
        notifications,
        nextCursor,
      }
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const count = await ctx.db.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    })

    return { count }
  }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.notificationId },
      })

      if (!notification || notification.recipientId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '알림을 찾을 수 없습니다.' })
      }

      return ctx.db.notification.update({
        where: { id: input.notificationId },
        data: { isRead: true },
      })
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    await ctx.db.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    })

    return { success: true }
  }),
})
