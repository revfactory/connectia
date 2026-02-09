'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Lock, Globe, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc'

interface GroupCardProps {
  id: string
  name: string
  coverImageUrl?: string | null
  avatarUrl?: string | null
  memberCount: number
  privacy: 'PUBLIC' | 'PRIVATE' | 'SECRET'
  isMember?: boolean
}

const privacyConfig = {
  PUBLIC: { icon: Globe, label: '공개 그룹' },
  PRIVATE: { icon: Lock, label: '비공개 그룹' },
  SECRET: { icon: EyeOff, label: '비밀 그룹' },
} as const

export function GroupCard({
  id,
  name,
  coverImageUrl,
  avatarUrl,
  memberCount,
  privacy,
  isMember = false,
}: GroupCardProps) {
  const [joined, setJoined] = useState(isMember)
  const utils = trpc.useUtils()

  const joinMutation = trpc.group.joinGroup.useMutation({
    onSuccess: () => {
      setJoined(true)
      utils.group.getGroups.invalidate()
      utils.group.getMyGroups.invalidate()
    },
  })

  const leaveMutation = trpc.group.leaveGroup.useMutation({
    onSuccess: () => {
      setJoined(false)
      utils.group.getGroups.invalidate()
      utils.group.getMyGroups.invalidate()
    },
  })

  const PrivacyIcon = privacyConfig[privacy].icon

  const handleToggleMembership = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (joined) {
      leaveMutation.mutate({ groupId: id })
    } else {
      joinMutation.mutate({ groupId: id })
    }
  }

  const isLoading = joinMutation.isPending || leaveMutation.isPending

  return (
    <Link href={`/groups/${id}`}>
      <div className="overflow-hidden rounded-lg bg-[var(--color-bg-card)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-dropdown)]">
        {/* 커버 이미지 */}
        <div className="relative aspect-video w-full bg-[var(--color-bg-active)]">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Users size={48} className="text-[var(--color-text-tertiary)]" />
            </div>
          )}
        </div>

        {/* 그룹 정보 */}
        <div className="relative px-4 pb-4 pt-8">
          {/* 아바타 오버랩 */}
          <div className="absolute -top-6 left-4">
            <Avatar
              src={avatarUrl}
              name={name}
              size="lg"
              className="border-3 border-[var(--color-bg-card)]"
            />
          </div>

          <h3 className="mt-1 truncate text-[15px] font-bold text-[var(--color-text-primary)]">
            {name}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
            <PrivacyIcon size={14} />
            <span>{privacyConfig[privacy].label}</span>
            <span>·</span>
            <span>멤버 {memberCount.toLocaleString()}명</span>
          </div>

          <div className="mt-3">
            <Button
              variant={joined ? 'secondary' : 'default'}
              size="sm"
              className="w-full"
              onClick={handleToggleMembership}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : joined ? '가입됨' : '가입'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
