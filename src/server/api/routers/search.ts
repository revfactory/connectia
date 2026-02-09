import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

// TODO: Meilisearch 연동
// 현재는 Prisma의 contains를 사용한 기본 검색입니다.
// 추후 Meilisearch를 도입하여 전문 검색(full-text search), 오타 교정,
// 검색어 하이라이팅, 인기 검색어 등의 기능을 구현할 예정입니다.
// import { MeiliSearch } from 'meilisearch'
// const meili = new MeiliSearch({ host: process.env.MEILISEARCH_URL! })

const searchInput = z.object({
  query: z.string().min(1).max(100),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
})

export const searchRouter = createTRPCRouter({
  /**
   * 통합 검색 (사용자 + 게시물)
   */
  searchAll: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input

      // TODO: Meilisearch multi-index search로 대체
      const [users, posts] = await Promise.all([
        ctx.db.user.findMany({
          where: {
            deletedAt: null,
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
            isOnline: true,
          },
          orderBy: { displayName: 'asc' },
        }),
        ctx.db.post.findMany({
          where: {
            deletedAt: null,
            audience: 'PUBLIC',
            OR: [
              { content: { contains: query, mode: 'insensitive' } },
              { contentPlainText: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
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
        }),
      ])

      return { users, posts }
    }),

  /**
   * 사용자 검색 (displayName, username LIKE)
   */
  searchUsers: publicProcedure
    .input(searchInput)
    .query(async ({ ctx, input }) => {
      const { query, cursor, limit } = input

      // TODO: Meilisearch users 인덱스 검색으로 대체
      const users = await ctx.db.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { displayName: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          isOnline: true,
        },
        orderBy: { displayName: 'asc' },
      })

      let nextCursor: string | undefined = undefined
      if (users.length > limit) {
        const nextItem = users.pop()
        nextCursor = nextItem!.id
      }

      return { users, nextCursor }
    }),

  /**
   * 게시물 검색 (content, contentPlainText LIKE)
   */
  searchPosts: publicProcedure
    .input(searchInput)
    .query(async ({ ctx, input }) => {
      const { query, cursor, limit } = input

      // TODO: Meilisearch posts 인덱스 검색으로 대체
      const posts = await ctx.db.post.findMany({
        where: {
          deletedAt: null,
          audience: 'PUBLIC',
          OR: [
            { content: { contains: query, mode: 'insensitive' } },
            { contentPlainText: { contains: query, mode: 'insensitive' } },
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

      let nextCursor: string | undefined = undefined
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
      }

      return { posts, nextCursor }
    }),
})
