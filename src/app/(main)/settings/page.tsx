'use client'

import * as React from 'react'
import {
  Settings,
  User,
  Shield,
  Bell,
  Lock,
  UserX,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
import { trpc } from '@/lib/trpc'

// ---------- 타입 ----------
type SettingsTab = 'general' | 'privacy' | 'notifications' | 'security' | 'account'

interface MenuItem {
  key: SettingsTab
  label: string
  icon: React.ElementType
}

const menuItems: MenuItem[] = [
  { key: 'general', label: '일반', icon: User },
  { key: 'privacy', label: '개인정보 보호', icon: Shield },
  { key: 'notifications', label: '알림', icon: Bell },
  { key: 'security', label: '보안', icon: Lock },
  { key: 'account', label: '계정', icon: UserX },
]

// ---------- 토글 스위치 ----------
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[var(--color-primary)]' : 'bg-[#CED0D4] dark:bg-[#3A3B3C]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

// ---------- 셀렉트 ----------
function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md bg-[var(--color-bg-input)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ---------- 메인 ----------
export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('general')

  const { data: settings, isLoading } = trpc.settings.getSettings.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <Skeleton className="h-8 w-32" />
        </Card>
        <Card className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Settings size={24} className="text-[var(--color-text-primary)]" />
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            설정
          </h1>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row gap-4">
        {/* 모바일: 가로 스크롤 메뉴 */}
        <div className="md:hidden overflow-x-auto">
          <div className="flex gap-1 min-w-max p-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[rgba(45,136,255,0.1)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 데스크톱: 왼쪽 사이드 메뉴 */}
        <Card className="hidden md:block w-[220px] shrink-0 p-2 h-fit">
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors text-left',
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[rgba(45,136,255,0.1)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  )}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </Card>

        {/* 오른쪽: 설정 패널 */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && settings && (
            <GeneralPanel settings={settings} />
          )}
          {activeTab === 'privacy' && settings && (
            <PrivacyPanel settings={settings} />
          )}
          {activeTab === 'notifications' && settings && (
            <NotificationsPanel settings={settings} />
          )}
          {activeTab === 'security' && <SecurityPanel />}
          {activeTab === 'account' && <AccountPanel />}
        </div>
      </div>
    </div>
  )
}

// ---------- 일반 설정 ----------
type SettingsData = {
  displayName: string
  bio: string | null
  location: string | null
  website: string | null
  gender: string | null
  dateOfBirth: Date | null
}

function GeneralPanel({ settings }: { settings: SettingsData }) {
  const [displayName, setDisplayName] = React.useState(settings.displayName || '')
  const [bio, setBio] = React.useState(settings.bio || '')
  const [location, setLocation] = React.useState(settings.location || '')
  const [website, setWebsite] = React.useState(settings.website || '')
  const [gender, setGender] = React.useState(settings.gender || '')
  const [dateOfBirth, setDateOfBirth] = React.useState(
    settings.dateOfBirth ? new Date(settings.dateOfBirth).toISOString().split('T')[0] : ''
  )

  const utils = trpc.useUtils()
  const updateProfile = trpc.settings.updateProfile.useMutation({
    onSuccess: () => {
      utils.settings.getSettings.invalidate()
    },
  })

  const handleSave = () => {
    updateProfile.mutate({
      displayName: displayName || undefined,
      bio: bio || null,
      location: location || null,
      website: website || null,
      gender: (gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY') || null,
      dateOfBirth: dateOfBirth || null,
    })
  }

  return (
    <Card className="p-6">
      <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-6">
        일반 설정
      </h2>
      <div className="space-y-5">
        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            표시 이름
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="표시 이름을 입력하세요"
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            소개
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="자신을 소개해주세요"
            maxLength={500}
            rows={3}
            className="flex w-full rounded-md bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-[var(--color-bg-card)] transition-colors resize-none"
          />
          <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
            {bio.length}/500
          </p>
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            위치
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="위치를 입력하세요"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            웹사이트
          </label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            성별
          </label>
          <Select
            value={gender}
            onChange={setGender}
            options={[
              { value: '', label: '선택하지 않음' },
              { value: 'MALE', label: '남성' },
              { value: 'FEMALE', label: '여성' },
              { value: 'OTHER', label: '기타' },
              { value: 'PREFER_NOT_TO_SAY', label: '밝히지 않음' },
            ]}
          />
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            생년월일
          </label>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="gap-2"
          >
            {updateProfile.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : updateProfile.isSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {updateProfile.isPending
              ? '저장 중...'
              : updateProfile.isSuccess
                ? '저장 완료'
                : '변경 사항 저장'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ---------- 개인정보 보호 ----------
type PrivacyData = {
  isPrivate: boolean
  privacySettings: unknown
}

function PrivacyPanel({ settings }: { settings: PrivacyData }) {
  const privacy = (settings.privacySettings || {}) as {
    whoCanSeePosts?: string
    whoCanSeeFriends?: string
    whoCanSendMessages?: string
  }

  const [isPrivate, setIsPrivate] = React.useState(settings.isPrivate)
  const [whoCanSeePosts, setWhoCanSeePosts] = React.useState(
    privacy.whoCanSeePosts || 'everyone'
  )
  const [whoCanSeeFriends, setWhoCanSeeFriends] = React.useState(
    privacy.whoCanSeeFriends || 'everyone'
  )
  const [whoCanSendMessages, setWhoCanSendMessages] = React.useState(
    privacy.whoCanSendMessages || 'everyone'
  )

  const utils = trpc.useUtils()
  const updatePrivacy = trpc.settings.updatePrivacy.useMutation({
    onSuccess: () => {
      utils.settings.getSettings.invalidate()
    },
  })

  const handleSave = () => {
    updatePrivacy.mutate({
      isPrivate,
      privacySettings: {
        whoCanSeePosts: whoCanSeePosts as 'everyone' | 'friends' | 'only_me',
        whoCanSeeFriends: whoCanSeeFriends as 'everyone' | 'friends' | 'only_me',
        whoCanSendMessages: whoCanSendMessages as 'everyone' | 'friends',
      },
    })
  }

  const audienceOptions = [
    { value: 'everyone', label: '모든 사람' },
    { value: 'friends', label: '친구만' },
    { value: 'only_me', label: '나만' },
  ]

  const messageOptions = [
    { value: 'everyone', label: '모든 사람' },
    { value: 'friends', label: '친구만' },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-6">
        개인정보 보호
      </h2>
      <div className="space-y-6">
        {/* 비공개 계정 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
              비공개 계정
            </p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
              승인한 사람만 내 콘텐츠를 볼 수 있습니다
            </p>
          </div>
          <Toggle checked={isPrivate} onChange={setIsPrivate} />
        </div>

        <div className="border-t border-[var(--color-divider)]" />

        {/* 게시물 공개 범위 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
              게시물 공개 범위
            </p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
              내 게시물을 볼 수 있는 사람
            </p>
          </div>
          <Select
            value={whoCanSeePosts}
            onChange={setWhoCanSeePosts}
            options={audienceOptions}
          />
        </div>

        {/* 친구 목록 공개 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
              친구 목록 공개
            </p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
              내 친구 목록을 볼 수 있는 사람
            </p>
          </div>
          <Select
            value={whoCanSeeFriends}
            onChange={setWhoCanSeeFriends}
            options={audienceOptions}
          />
        </div>

        {/* 메시지 수신 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
              메시지 수신
            </p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
              나에게 메시지를 보낼 수 있는 사람
            </p>
          </div>
          <Select
            value={whoCanSendMessages}
            onChange={setWhoCanSendMessages}
            options={messageOptions}
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={updatePrivacy.isPending}
            className="gap-2"
          >
            {updatePrivacy.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : updatePrivacy.isSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {updatePrivacy.isPending
              ? '저장 중...'
              : updatePrivacy.isSuccess
                ? '저장 완료'
                : '변경 사항 저장'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ---------- 알림 설정 ----------
type NotifData = {
  notificationSettings: unknown
}

function NotificationsPanel({ settings }: { settings: NotifData }) {
  const notifSettings = (settings.notificationSettings || {}) as {
    friendRequests?: boolean
    comments?: boolean
    likes?: boolean
    messages?: boolean
    groupInvites?: boolean
    eventInvites?: boolean
    birthdays?: boolean
  }

  const [friendRequests, setFriendRequests] = React.useState(
    notifSettings.friendRequests !== false
  )
  const [comments, setComments] = React.useState(notifSettings.comments !== false)
  const [likes, setLikes] = React.useState(notifSettings.likes !== false)
  const [messages, setMessages] = React.useState(notifSettings.messages !== false)
  const [groupInvites, setGroupInvites] = React.useState(
    notifSettings.groupInvites !== false
  )
  const [eventInvites, setEventInvites] = React.useState(
    notifSettings.eventInvites !== false
  )
  const [birthdays, setBirthdays] = React.useState(notifSettings.birthdays !== false)

  const utils = trpc.useUtils()
  const updateNotifications = trpc.settings.updateNotificationSettings.useMutation({
    onSuccess: () => {
      utils.settings.getSettings.invalidate()
    },
  })

  const handleSave = () => {
    updateNotifications.mutate({
      notificationSettings: {
        friendRequests,
        comments,
        likes,
        messages,
        groupInvites,
        eventInvites,
        birthdays,
      },
    })
  }

  const notifItems: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }[] = [
    {
      label: '친구 요청',
      description: '새로운 친구 요청을 받았을 때 알림',
      checked: friendRequests,
      onChange: setFriendRequests,
    },
    {
      label: '댓글',
      description: '내 게시물에 댓글이 달렸을 때 알림',
      checked: comments,
      onChange: setComments,
    },
    {
      label: '좋아요',
      description: '내 게시물에 좋아요가 눌렸을 때 알림',
      checked: likes,
      onChange: setLikes,
    },
    {
      label: '메시지',
      description: '새로운 메시지를 받았을 때 알림',
      checked: messages,
      onChange: setMessages,
    },
    {
      label: '그룹 초대',
      description: '그룹에 초대되었을 때 알림',
      checked: groupInvites,
      onChange: setGroupInvites,
    },
    {
      label: '이벤트 초대',
      description: '이벤트에 초대되었을 때 알림',
      checked: eventInvites,
      onChange: setEventInvites,
    },
    {
      label: '생일',
      description: '친구의 생일 알림',
      checked: birthdays,
      onChange: setBirthdays,
    },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-6">
        알림 설정
      </h2>
      <div className="space-y-5">
        {notifItems.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <div className="border-t border-[var(--color-divider)]" />
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
                  {item.label}
                </p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                  {item.description}
                </p>
              </div>
              <Toggle checked={item.checked} onChange={item.onChange} />
            </div>
          </React.Fragment>
        ))}

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={updateNotifications.isPending}
            className="gap-2"
          >
            {updateNotifications.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : updateNotifications.isSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {updateNotifications.isPending
              ? '저장 중...'
              : updateNotifications.isSuccess
                ? '저장 완료'
                : '변경 사항 저장'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ---------- 보안 설정 ----------
function SecurityPanel() {
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [error, setError] = React.useState('')

  const updatePassword = trpc.settings.updatePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('새 비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    updatePassword.mutate({ currentPassword, newPassword })
  }

  return (
    <Card className="p-6">
      <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-6">
        보안
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            현재 비밀번호
          </label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            새 비밀번호
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (최소 8자)"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">
            새 비밀번호 확인
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호를 다시 입력하세요"
          />
        </div>

        {error && (
          <p className="text-[13px] text-[var(--color-error)] flex items-center gap-1.5">
            <AlertTriangle size={14} />
            {error}
          </p>
        )}

        {updatePassword.isSuccess && (
          <p className="text-[13px] text-[var(--color-online)] flex items-center gap-1.5">
            <Check size={14} />
            비밀번호가 성공적으로 변경되었습니다.
          </p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={
              updatePassword.isPending ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="gap-2"
          >
            {updatePassword.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Lock size={16} />
            )}
            {updatePassword.isPending ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// ---------- 계정 설정 ----------
function AccountPanel() {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState('')

  const deleteAccount = trpc.settings.deleteAccount.useMutation({
    onSuccess: () => {
      window.location.href = '/login'
    },
  })

  const handleDelete = () => {
    if (confirmText === '계정 삭제') {
      deleteAccount.mutate()
    }
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-6">
          계정
        </h2>

        <div className="space-y-6">
          {/* 계정 비활성화/삭제 안내 */}
          <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-[var(--color-error)] mt-0.5 shrink-0" />
              <div>
                <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
                  위험 구역
                </p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                  이 작업은 되돌릴 수 없으니 신중하게 결정해주세요.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="gap-2"
            >
              <UserX size={16} />
              계정 삭제
            </Button>
          </div>
        </div>
      </Card>

      {/* 계정 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setConfirmText('')
        }}
        title="계정 삭제"
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[var(--color-text-secondary)]">
            정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            계속하려면 아래에 <strong className="text-[var(--color-text-primary)]">계정 삭제</strong>를 입력하세요.
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="계정 삭제"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false)
                setConfirmText('')
              }}
            >
              취소
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== '계정 삭제' || deleteAccount.isPending}
              onClick={handleDelete}
              className="gap-2"
            >
              {deleteAccount.isPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {deleteAccount.isPending ? '삭제 중...' : '영구 삭제'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
