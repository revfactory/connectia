import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '관리자 권한이 필요합니다.',
    })
  }
  return next({ ctx })
})

export const adminRouter = createTRPCRouter({
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalUsers, newUsers, totalPosts, totalGroups, pendingReports] =
      await Promise.all([
        ctx.db.user.count({ where: { deletedAt: null } }),
        ctx.db.user.count({
          where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
        }),
        ctx.db.post.count({ where: { deletedAt: null } }),
        ctx.db.group.count(),
        ctx.db.report.count({ where: { status: 'PENDING' } }),
      ])

    return {
      totalUsers,
      newUsers,
      totalPosts,
      totalGroups,
      pendingReports,
    }
  }),

  getUsers: adminProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        search: z.string().optional(),
        role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, search, role } = input

      const where: Record<string, unknown> = { deletedAt: null }

      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (role) {
        where.role = role
      }

      const users = await ctx.db.user.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          avatarUrl: true,
          role: true,
          isOnline: true,
          createdAt: true,
        },
      })

      let nextCursor: string | undefined
      if (users.length > limit) {
        const nextItem = users.pop()
        nextCursor = nextItem?.id
      }

      return { users, nextCursor }
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['USER', 'MODERATOR', 'ADMIN']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '자신의 역할은 변경할 수 없습니다.',
        })
      }

      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
        },
      })

      return user
    }),

  getReports: adminProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        status: z
          .enum(['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, status } = input

      const where: Record<string, unknown> = {}
      if (status) {
        where.status = status
      }

      const reports = await ctx.db.report.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      })

      let nextCursor: string | undefined
      if (reports.length > limit) {
        const nextItem = reports.pop()
        nextCursor = nextItem?.id
      }

      return { reports, nextCursor }
    }),

  updateReportStatus: adminProcedure
    .input(
      z.object({
        reportId: z.string(),
        status: z.enum(['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.report.update({
        where: { id: input.reportId },
        data: {
          status: input.status,
          reviewedBy: ctx.session.user.id,
        },
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      })

      return report
    }),
})
