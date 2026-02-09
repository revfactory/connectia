import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const eventRouter = createTRPCRouter({
  getEvents: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        upcoming: z.boolean().default(true),
        groupId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, upcoming, groupId } = input

      const events = await ctx.db.event.findMany({
        where: {
          ...(upcoming && { startDate: { gte: new Date() } }),
          ...(groupId && { groupId }),
          privacy: 'PUBLIC',
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { startDate: 'asc' },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (events.length > limit) {
        const nextItem = events.pop()
        nextCursor = nextItem!.id
      }

      return { events, nextCursor }
    }),

  getEventById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          attendees: {
            where: { status: { in: ['GOING', 'INTERESTED'] } },
            take: 10,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: { attendees: true },
          },
        },
      })

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' })
      }

      // 현재 유저의 참석 상태 확인
      let currentAttendee = null
      if (ctx.session?.user) {
        currentAttendee = await ctx.db.eventAttendee.findUnique({
          where: {
            eventId_userId: {
              eventId: input.id,
              userId: ctx.session.user.id,
            },
          },
        })
      }

      return { ...event, currentAttendee }
    }),

  createEvent: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        startDate: z.string().transform((s) => new Date(s)),
        endDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
        location: z.string().max(300).optional(),
        isOnline: z.boolean().default(false),
        onlineUrl: z.string().optional(),
        privacy: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
        groupId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // 그룹 이벤트인 경우 멤버 여부 확인
      if (input.groupId) {
        const membership = await ctx.db.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: input.groupId,
              userId,
            },
          },
        })
        if (!membership || membership.leftAt) {
          throw new TRPCError({ code: 'FORBIDDEN', message: '그룹 멤버만 이벤트를 만들 수 있습니다.' })
        }
      }

      const event = await ctx.db.event.create({
        data: {
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          location: input.location,
          isOnline: input.isOnline,
          onlineUrl: input.onlineUrl,
          privacy: input.privacy,
          hostId: userId,
          groupId: input.groupId,
          attendeeCount: 1,
        },
      })

      // 생성자를 GOING으로 자동 추가
      await ctx.db.eventAttendee.create({
        data: {
          eventId: event.id,
          userId,
          status: 'GOING',
        },
      })

      return event
    }),

  respondToEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        status: z.enum(['GOING', 'INTERESTED', 'NOT_GOING']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
      })

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' })
      }

      const existing = await ctx.db.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId,
          },
        },
      })

      const oldStatus = existing?.status

      if (existing) {
        await ctx.db.eventAttendee.update({
          where: { id: existing.id },
          data: { status: input.status },
        })
      } else {
        await ctx.db.eventAttendee.create({
          data: {
            eventId: input.eventId,
            userId,
            status: input.status,
          },
        })
      }

      // 카운트 업데이트
      const attendeeCountChange =
        (input.status === 'GOING' ? 1 : 0) - (oldStatus === 'GOING' ? 1 : 0)
      const interestedCountChange =
        (input.status === 'INTERESTED' ? 1 : 0) - (oldStatus === 'INTERESTED' ? 1 : 0)

      if (attendeeCountChange !== 0 || interestedCountChange !== 0) {
        await ctx.db.event.update({
          where: { id: input.eventId },
          data: {
            ...(attendeeCountChange !== 0 && {
              attendeeCount: { increment: attendeeCountChange },
            }),
            ...(interestedCountChange !== 0 && {
              interestedCount: { increment: interestedCountChange },
            }),
          },
        })
      }

      return { success: true }
    }),

  getMyEvents: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input
      const userId = ctx.session.user.id

      const attendees = await ctx.db.eventAttendee.findMany({
        where: {
          userId,
          status: { in: ['GOING', 'INTERESTED'] },
          event: { startDate: { gte: new Date() } },
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { event: { startDate: 'asc' } },
        include: {
          event: {
            include: {
              host: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
              group: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (attendees.length > limit) {
        const nextItem = attendees.pop()
        nextCursor = nextItem!.id
      }

      return {
        events: attendees.map((a) => ({ ...a.event, myStatus: a.status })),
        nextCursor,
      }
    }),
})
