import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { hash, compare } from 'bcryptjs'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const settingsRouter = createTRPCRouter({
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        location: true,
        website: true,
        gender: true,
        dateOfBirth: true,
        isPrivate: true,
        privacySettings: true,
        notificationSettings: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' })
    }

    return user
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(50).optional(),
        bio: z.string().max(500).optional().nullable(),
        location: z.string().max(100).optional().nullable(),
        website: z.string().max(200).optional().nullable(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
        dateOfBirth: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {}
      if (input.displayName !== undefined) data.displayName = input.displayName
      if (input.bio !== undefined) data.bio = input.bio
      if (input.location !== undefined) data.location = input.location
      if (input.website !== undefined) data.website = input.website
      if (input.gender !== undefined) data.gender = input.gender
      if (input.dateOfBirth !== undefined) {
        data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null
      }

      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data,
      })

      return user
    }),

  updatePrivacy: protectedProcedure
    .input(
      z.object({
        isPrivate: z.boolean().optional(),
        privacySettings: z
          .object({
            whoCanSeePosts: z.enum(['everyone', 'friends', 'only_me']).optional(),
            whoCanSeeFriends: z.enum(['everyone', 'friends', 'only_me']).optional(),
            whoCanSendMessages: z.enum(['everyone', 'friends']).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {}
      if (input.isPrivate !== undefined) data.isPrivate = input.isPrivate
      if (input.privacySettings !== undefined) data.privacySettings = input.privacySettings

      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data,
      })

      return user
    }),

  updateNotificationSettings: protectedProcedure
    .input(
      z.object({
        notificationSettings: z.object({
          friendRequests: z.boolean().optional(),
          comments: z.boolean().optional(),
          likes: z.boolean().optional(),
          messages: z.boolean().optional(),
          groupInvites: z.boolean().optional(),
          eventInvites: z.boolean().optional(),
          birthdays: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          notificationSettings: input.notificationSettings,
        },
      })

      return user
    }),

  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { passwordHash: true },
      })

      if (!user?.passwordHash) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.',
        })
      }

      const isValid = await compare(input.currentPassword, user.passwordHash)
      if (!isValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '현재 비밀번호가 일치하지 않습니다.',
        })
      }

      const passwordHash = await hash(input.newPassword, 12)
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { passwordHash },
      })

      return { success: true }
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { deletedAt: new Date() },
    })

    return { success: true }
  }),
})
