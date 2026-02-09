import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const messageRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const members = await ctx.db.conversationMember.findMany({
      where: {
        userId,
        leftAt: null,
      },
      include: {
        conversation: {
          include: {
            members: {
              where: { leftAt: null },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    isOnline: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                sender: {
                  select: {
                    id: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: { lastMessageAt: 'desc' },
      },
    })

    return members.map((m) => {
      const conv = m.conversation
      const lastMessage = conv.messages[0] ?? null
      const otherMembers = conv.members.filter(
        (member) => member.userId !== userId
      )

      // DIRECT 대화인 경우 상대방 정보로 대화 이름/아바타 결정
      const displayName =
        conv.type === 'DIRECT' && otherMembers.length > 0
          ? otherMembers[0].user.displayName
          : conv.name ?? '그룹 대화'

      const displayAvatar =
        conv.type === 'DIRECT' && otherMembers.length > 0
          ? otherMembers[0].user.avatarUrl
          : conv.avatarUrl

      const isOnline =
        conv.type === 'DIRECT' && otherMembers.length > 0
          ? otherMembers[0].user.isOnline
          : false

      // 읽지 않은 메시지 여부 판별
      const hasUnread = lastMessage
        ? m.lastReadMessageId !== lastMessage.id
        : false

      return {
        id: conv.id,
        type: conv.type,
        name: displayName,
        avatarUrl: displayAvatar,
        isOnline,
        lastMessage,
        lastMessageAt: conv.lastMessageAt,
        memberCount: conv.memberCount,
        members: otherMembers.map((om) => om.user),
        hasUnread,
        isMuted: m.isMuted,
      }
    })
  }),

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { conversationId, cursor, limit } = input

      // 대화 멤버 확인
      const membership = await ctx.db.conversationMember.findUnique({
        where: {
          conversationId_userId: { conversationId, userId },
        },
      })

      if (!membership || membership.leftAt) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '이 대화에 접근할 수 없습니다.',
        })
      }

      const messages = await ctx.db.message.findMany({
        where: {
          conversationId,
          deletedAt: null,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          },
        },
      })

      let nextCursor: string | undefined = undefined
      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem!.id
      }

      return { messages, nextCursor }
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(5000),
        type: z
          .enum([
            'TEXT',
            'IMAGE',
            'VIDEO',
            'FILE',
            'AUDIO',
            'SYSTEM',
            'EMOJI',
            'REPLY',
          ])
          .default('TEXT'),
        replyToMessageId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { conversationId, content, type, replyToMessageId } = input

      // 대화 멤버 확인
      const membership = await ctx.db.conversationMember.findUnique({
        where: {
          conversationId_userId: { conversationId, userId },
        },
      })

      if (!membership || membership.leftAt) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '이 대화에 메시지를 보낼 수 없습니다.',
        })
      }

      const message = await ctx.db.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
          type,
          replyToMessageId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          },
        },
      })

      // 대화의 lastMessage 업데이트
      await ctx.db.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageId: message.id,
          lastMessageAt: message.createdAt,
        },
      })

      // 보낸 사람의 읽음 상태 업데이트
      await ctx.db.conversationMember.update({
        where: {
          conversationId_userId: { conversationId, userId },
        },
        data: {
          lastReadMessageId: message.id,
        },
      })

      return message
    }),

  createConversation: protectedProcedure
    .input(
      z.object({
        type: z.enum(['DIRECT', 'GROUP']).default('DIRECT'),
        memberIds: z.array(z.string()).min(1),
        name: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { type, memberIds, name } = input

      // DIRECT 대화인 경우 이미 존재하는지 확인
      if (type === 'DIRECT' && memberIds.length === 1) {
        const existingConversation = await ctx.db.conversation.findFirst({
          where: {
            type: 'DIRECT',
            AND: [
              {
                members: {
                  some: { userId, leftAt: null },
                },
              },
              {
                members: {
                  some: { userId: memberIds[0], leftAt: null },
                },
              },
            ],
          },
        })

        if (existingConversation) {
          return existingConversation
        }
      }

      const allMemberIds = [userId, ...memberIds.filter((id) => id !== userId)]

      const conversation = await ctx.db.conversation.create({
        data: {
          type,
          name: type === 'GROUP' ? name : null,
          creatorId: userId,
          memberCount: allMemberIds.length,
          members: {
            create: allMemberIds.map((memberId) => ({
              userId: memberId,
              role: memberId === userId ? 'ADMIN' : 'MEMBER',
            })),
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  isOnline: true,
                },
              },
            },
          },
        },
      })

      return conversation
    }),

  markAsRead: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        messageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { conversationId, messageId } = input

      await ctx.db.conversationMember.update({
        where: {
          conversationId_userId: { conversationId, userId },
        },
        data: {
          lastReadMessageId: messageId,
        },
      })

      return { success: true }
    }),

  getConversationInfo: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const membership = await ctx.db.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId,
          },
        },
      })

      if (!membership || membership.leftAt) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '이 대화에 접근할 수 없습니다.',
        })
      }

      const conversation = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
        include: {
          members: {
            where: { leftAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  isOnline: true,
                },
              },
            },
          },
        },
      })

      if (!conversation) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const otherMembers = conversation.members.filter(
        (m) => m.userId !== userId
      )

      return {
        ...conversation,
        displayName:
          conversation.type === 'DIRECT' && otherMembers.length > 0
            ? otherMembers[0].user.displayName
            : conversation.name ?? '그룹 대화',
        displayAvatar:
          conversation.type === 'DIRECT' && otherMembers.length > 0
            ? otherMembers[0].user.avatarUrl
            : conversation.avatarUrl,
        isOnline:
          conversation.type === 'DIRECT' && otherMembers.length > 0
            ? otherMembers[0].user.isOnline
            : false,
      }
    }),
})
