import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { ProfileCover } from '@/components/profile/profile-cover'
import { ProfileInfo } from '@/components/profile/profile-info'
import { Camera, UserPlus, MessageCircle, MoreHorizontal, Pencil } from 'lucide-react'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  // TODO: fetch user data with tRPC
  const isOwner = false // TODO: check if current user

  return (
    <div className="-mx-4 -mt-6">
      {/* Cover Section */}
      <ProfileCover
        coverImageUrl={null}
        avatarUrl={null}
        displayName={username}
        isOwner={isOwner}
      />

      {/* Profile Info */}
      <div className="bg-[var(--color-bg-card)] px-4 pb-4">
        <ProfileInfo
          displayName={username}
          friendCount={0}
          bio={null}
          isOwner={isOwner}
        />
      </div>

      {/* Tabs */}
      <div className="bg-[var(--color-bg-card)] border-t border-[var(--color-divider)] mt-0">
        <ProfileTabs username={username} />
      </div>

      {/* Tab Content - Posts (default) */}
      <div className="mt-4 px-4 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Left: About summary + Photos */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-xl font-bold mb-3">소개</h3>
            <p className="text-[var(--color-text-secondary)] text-[15px]">소개가 없습니다.</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">사진</h3>
              <button className="text-[var(--color-primary)] text-[15px] hover:underline">모든 사진 보기</button>
            </div>
            <p className="text-[var(--color-text-secondary)] text-[15px]">사진이 없습니다.</p>
          </Card>
        </div>

        {/* Right: Posts */}
        <div className="space-y-4">
          <Card className="p-8 text-center">
            <p className="text-[var(--color-text-secondary)] text-[15px]">아직 게시물이 없습니다.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
