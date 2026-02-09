import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const groupRouter = createTRPCRouter({
  getGroups: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        search: z.string().optional(),
        privacy: z.enum(['PUBLIC', 'PRIVATE', 'SECRET']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, search, privacy } = input

      const groups = await ctx.db.group.findMany({
        where: {
          ...(search && {
            name: { contains: search, mode: 'insensitive' as const },
          }),
          ...(privacy && { privacy }),
          // SECRET 그룹은 검색에서 숨김 (멤버가 아닌 경우)
          ...(!privacy && { privacy: { not: 'SECRET' } }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { memberCount: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (groups.length > limit) {
        const nextItem = groups.pop()
        nextCursor = nextItem!.id
      }

      return { groups, nextCursor }
    }),

  getGroupById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { members: true, posts: true, events: true },
          },
        },
      })

      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '그룹을 찾을 수 없습니다.' })
      }

      // 현재 유저의 멤버십 확인
      let currentMembership = null
      if (ctx.session?.user) {
        currentMembership = await ctx.db.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: input.id,
              userId: ctx.session.user.id,
            },
          },
        })
        // 탈퇴한 멤버는 null 처리
        if (currentMembership?.leftAt) {
          currentMembership = null
        }
      }

      return { ...group, currentMembership }
    }),

  createGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(2000).optional(),
        privacy: z.enum(['PUBLIC', 'PRIVATE', 'SECRET']).default('PUBLIC'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const group = await ctx.db.group.create({
        data: {
          name: input.name,
          description: input.description,
          privacy: input.privacy,
          creatorId: userId,
          memberCount: 1,
        },
      })

      // 생성자를 ADMIN으로 자동 추가
      await ctx.db.groupMember.create({
        data: {
          groupId: group.id,
          userId,
          role: 'ADMIN',
        },
      })

      return group
    }),

  joinGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
      })

      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '그룹을 찾을 수 없습니다.' })
      }

      // 기존 멤버십 확인
      const existing = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId,
          },
        },
      })

      if (existing && !existing.leftAt) {
        throw new TRPCError({ code: 'CONFLICT', message: '이미 그룹에 가입되어 있습니다.' })
      }

      if (existing && existing.leftAt) {
        // 재가입
        await ctx.db.groupMember.update({
          where: { id: existing.id },
          data: { leftAt: null, role: 'MEMBER', joinedAt: new Date() },
        })
      } else {
        await ctx.db.groupMember.create({
          data: {
            groupId: input.groupId,
            userId,
            role: 'MEMBER',
          },
        })
      }

      await ctx.db.group.update({
        where: { id: input.groupId },
        data: { memberCount: { increment: 1 } },
      })

      return { success: true }
    }),

  leaveGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const membership = await ctx.db.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId,
          },
        },
      })

      if (!membership || membership.leftAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '그룹 멤버가 아닙니다.' })
      }

      await ctx.db.groupMember.update({
        where: { id: membership.id },
        data: { leftAt: new Date() },
      })

      await ctx.db.group.update({
        where: { id: input.groupId },
        data: { memberCount: { decrement: 1 } },
      })

      return { success: true }
    }),

  getMyGroups: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input
      const userId = ctx.session.user.id

      const memberships = await ctx.db.groupMember.findMany({
        where: {
          userId,
          leftAt: null,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { joinedAt: 'desc' },
        include: {
          group: {
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (memberships.length > limit) {
        const nextItem = memberships.pop()
        nextCursor = nextItem!.id
      }

      return {
        groups: memberships.map((m) => ({ ...m.group, role: m.role })),
        nextCursor,
      }
    }),
})
