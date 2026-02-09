'use client'

import { useState } from 'react'
import { use } from 'react'
import Image from 'next/image'
import {
  Users,
  Globe,
  Lock,
  EyeOff,
  MessageSquare,
  Calendar,
  Info,
  LogOut,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

type Tab = 'discussion' | 'members' | 'events' | 'about'

const tabConfig: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'discussion', label: '토론', icon: MessageSquare },
  { key: 'members', label: '멤버', icon: Users },
  { key: 'events', label: '이벤트', icon: Calendar },
  { key: 'about', label: '소개', icon: Info },
]

const privacyConfig = {
  PUBLIC: { icon: Globe, label: '공개 그룹' },
  PRIVATE: { icon: Lock, label: '비공개 그룹' },
  SECRET: { icon: EyeOff, label: '비밀 그룹' },
} as const

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = use(params)
  const [activeTab, setActiveTab] = useState<Tab>('discussion')

  const utils = trpc.useUtils()
  const { data: group, isLoading } = trpc.group.getGroupById.useQuery({ id: groupId })

  const joinMutation = trpc.group.joinGroup.useMutation({
    onSuccess: () => {
      utils.group.getGroupById.invalidate({ id: groupId })
      utils.group.getMyGroups.invalidate()
    },
  })

  const leaveMutation = trpc.group.leaveGroup.useMutation({
    onSuccess: () => {
      utils.group.getGroupById.invalidate({ id: groupId })
      utils.group.getMyGroups.invalidate()
    },
  })

  const isMember = !!group?.currentMembership
  const isAdmin = group?.currentMembership?.role === 'ADMIN'
  const membershipLoading = joinMutation.isPending || leaveMutation.isPending

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <Skeleton className="h-[200px] w-full" />
          <div className="p-4">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-4 h-9 w-32" />
          </div>
        </Card>
      </div>
    )
  }

  if (!group) {
    return (
      <Card className="p-8 text-center">
        <p className="text-[15px] text-[var(--color-text-secondary)]">
          그룹을 찾을 수 없습니다.
        </p>
      </Card>
    )
  }

  const PrivacyIcon = privacyConfig[group.privacy].icon

  return (
    <div className="space-y-4">
      {/* 커버 이미지 및 그룹 정보 */}
      <Card className="overflow-hidden">
        {/* 커버 */}
        <div className="relative h-[200px] w-full bg-[var(--color-bg-active)]">
          {group.coverImageUrl ? (
            <Image
              src={group.coverImageUrl}
              alt={group.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Users size={64} className="text-[var(--color-text-tertiary)]" />
            </div>
          )}
        </div>

        {/* 그룹 정보 */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
                {group.name}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1">
                  <PrivacyIcon size={16} />
                  {privacyConfig[group.privacy].label}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  멤버 {group.memberCount.toLocaleString()}명
                </span>
              </div>

              {group.description && (
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                  {group.description}
                </p>
              )}
            </div>

            {/* 가입/탈퇴 버튼 */}
            <div className="shrink-0">
              {isMember ? (
                <Button
                  variant="secondary"
                  onClick={() => leaveMutation.mutate({ groupId })}
                  disabled={membershipLoading || isAdmin}
                  title={isAdmin ? '관리자는 그룹을 탈퇴할 수 없습니다' : undefined}
                >
                  <LogOut size={16} className="mr-1.5" />
                  {membershipLoading ? '처리 중...' : '탈퇴'}
                </Button>
              ) : (
                <Button
                  onClick={() => joinMutation.mutate({ groupId })}
                  disabled={membershipLoading}
                >
                  <UserPlus size={16} className="mr-1.5" />
                  {membershipLoading ? '처리 중...' : '가입'}
                </Button>
              )}
            </div>
          </div>

          {/* 탭 */}
          <div className="mt-4 flex gap-1 border-t border-[var(--color-divider)] pt-3">
            {tabConfig.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[rgba(45,136,255,0.1)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* 탭 콘텐츠 */}
      {activeTab === 'discussion' && (
        <Card className="p-8 text-center">
          <MessageSquare size={48} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
            아직 게시물이 없습니다.
          </p>
          <p className="mt-1 text-[13px] text-[var(--color-text-tertiary)]">
            TODO: 그룹 게시물 연동
          </p>
        </Card>
      )}

      {activeTab === 'members' && (
        <Card className="p-4">
          <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">
            멤버 ({group.memberCount.toLocaleString()})
          </h2>

          {/* 관리자 */}
          <div className="mt-4">
            <h3 className="text-[13px] font-semibold text-[var(--color-text-secondary)]">
              관리자
            </h3>
            <div className="mt-2 flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--color-bg-hover)] transition-colors">
              <Avatar
                src={group.creator.avatarUrl}
                name={group.creator.displayName}
                size="md"
              />
              <div>
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  {group.creator.displayName}
                </p>
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  @{group.creator.username}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'events' && (
        <Card className="p-8 text-center">
          <Calendar size={48} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
            예정된 이벤트가 없습니다.
          </p>
        </Card>
      )}

      {activeTab === 'about' && (
        <Card className="p-4 space-y-4">
          <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">
            소개
          </h2>

          {group.description ? (
            <p className="text-[14px] leading-relaxed text-[var(--color-text-primary)]">
              {group.description}
            </p>
          ) : (
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              그룹 설명이 없습니다.
            </p>
          )}

          <div className="space-y-3 border-t border-[var(--color-divider)] pt-4">
            <div className="flex items-center gap-3 text-[14px]">
              <PrivacyIcon size={20} className="text-[var(--color-text-secondary)]" />
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {privacyConfig[group.privacy].label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[14px]">
              <Users size={20} className="text-[var(--color-text-secondary)]" />
              <p className="text-[var(--color-text-primary)]">
                멤버 {group.memberCount.toLocaleString()}명
              </p>
            </div>

            <div className="flex items-center gap-3 text-[14px]">
              <Calendar size={20} className="text-[var(--color-text-secondary)]" />
              <p className="text-[var(--color-text-primary)]">
                {new Date(group.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                에 생성됨
              </p>
            </div>
          </div>

          {group.rules && (
            <div className="border-t border-[var(--color-divider)] pt-4">
              <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">
                그룹 규칙
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-text-primary)]">
                {group.rules}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
