import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const storyRouter = createTRPCRouter({
  /**
   * 친구들의 활성 스토리 목록 조회 (expiresAt > now, 작성자별 그룹)
   */
  getFeedStories: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const now = new Date()

    // 친구 ID 목록 조회
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

    // 본인 + 친구들의 활성 스토리 조회
    const stories = await ctx.db.story.findMany({
      where: {
        expiresAt: { gt: now },
        authorId: { in: [userId, ...friendIds] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isOnline: true,
          },
        },
        views: {
          where: { viewerId: userId },
          select: { id: true },
        },
      },
    })

    // 작성자별 그룹핑
    const groupedMap = new Map<
      string,
      {
        author: (typeof stories)[0]['author']
        stories: Array<{
          id: string
          mediaUrl: string
          mediaType: string
          caption: string | null
          backgroundColor: string | null
          viewCount: number
          expiresAt: Date
          createdAt: Date
          hasViewed: boolean
        }>
        hasUnviewed: boolean
      }
    >()

    for (const story of stories) {
      const authorId = story.authorId
      const hasViewed = story.views.length > 0

      if (!groupedMap.has(authorId)) {
        groupedMap.set(authorId, {
          author: story.author,
          stories: [],
          hasUnviewed: false,
        })
      }

      const group = groupedMap.get(authorId)!
      group.stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        backgroundColor: story.backgroundColor,
        viewCount: story.viewCount,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        hasViewed,
      })

      if (!hasViewed) {
        group.hasUnviewed = true
      }
    }

    // 본인의 스토리를 맨 앞에, 나머지는 안 본 스토리가 있는 그룹 우선
    const grouped = Array.from(groupedMap.values())
    grouped.sort((a, b) => {
      if (a.author.id === userId) return -1
      if (b.author.id === userId) return 1
      if (a.hasUnviewed && !b.hasUnviewed) return -1
      if (!a.hasUnviewed && b.hasUnviewed) return 1
      return 0
    })

    return grouped
  }),

  /**
   * 특정 스토리의 뷰어 목록
   */
  getStoryViews: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const story = await ctx.db.story.findUnique({
        where: { id: input.storyId },
        select: { authorId: true },
      })

      if (!story || story.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '본인의 스토리만 뷰어를 확인할 수 있습니다.',
        })
      }

      const views = await ctx.db.storyView.findMany({
        where: { storyId: input.storyId },
        orderBy: { viewedAt: 'desc' },
        include: {
          viewer: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      })

      return views
    }),

  /**
   * 스토리 생성
   */
  createStory: protectedProcedure
    .input(
      z.object({
        mediaUrl: z.string().url(),
        mediaType: z.enum(['IMAGE', 'VIDEO']),
        caption: z.string().max(500).optional(),
        backgroundColor: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const story = await ctx.db.story.create({
        data: {
          authorId: ctx.session.user.id,
          mediaUrl: input.mediaUrl,
          mediaType: input.mediaType,
          caption: input.caption,
          backgroundColor: input.backgroundColor,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후 만료
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      })

      return story
    }),

  /**
   * 스토리 조회 기록
   */
  viewStory: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const story = await ctx.db.story.findUnique({
        where: { id: input.storyId },
      })

      if (!story) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '스토리를 찾을 수 없습니다.' })
      }

      // 본인 스토리는 조회 기록을 남기지 않음
      if (story.authorId === userId) {
        return { success: true }
      }

      // upsert: 이미 본 스토리는 중복 기록하지 않음
      await ctx.db.storyView.upsert({
        where: {
          storyId_viewerId: {
            storyId: input.storyId,
            viewerId: userId,
          },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          storyId: input.storyId,
          viewerId: userId,
        },
      })

      // viewCount 증가
      await ctx.db.story.update({
        where: { id: input.storyId },
        data: { viewCount: { increment: 1 } },
      })

      return { success: true }
    }),
})
