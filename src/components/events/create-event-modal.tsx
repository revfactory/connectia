'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  groupId?: string
}

export function CreateEventModal({ isOpen, onClose, groupId }: CreateEventModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [onlineUrl, setOnlineUrl] = useState('')
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')

  const utils = trpc.useUtils()

  const createMutation = trpc.event.createEvent.useMutation({
    onSuccess: () => {
      utils.event.getEvents.invalidate()
      utils.event.getMyEvents.invalidate()
      handleClose()
    },
  })

  const handleClose = () => {
    setName('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setLocation('')
    setIsOnline(false)
    setOnlineUrl('')
    setPrivacy('PUBLIC')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !startDate) return
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      location: location.trim() || undefined,
      isOnline,
      onlineUrl: isOnline ? onlineUrl.trim() || undefined : undefined,
      privacy,
      groupId,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="이벤트 만들기">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이벤트 이름 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
            이벤트 이름
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이벤트 이름을 입력하세요"
            maxLength={200}
            required
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
            설명 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이벤트에 대해 설명해주세요"
            maxLength={5000}
            rows={3}
            className="flex w-full rounded-md bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-[var(--color-bg-card)] transition-colors resize-none"
          />
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
              시작 날짜
            </label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
              종료 날짜 (선택)
            </label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>

        {/* 온라인 여부 */}
        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-divider)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-[14px] text-[var(--color-text-primary)]">
              온라인 이벤트
            </span>
          </label>
        </div>

        {/* 위치 / 온라인 URL */}
        {isOnline ? (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
              온라인 URL (선택)
            </label>
            <Input
              value={onlineUrl}
              onChange={(e) => setOnlineUrl(e.target.value)}
              placeholder="https://zoom.us/..."
              type="url"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
              위치 (선택)
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="이벤트 장소를 입력하세요"
              maxLength={300}
            />
          </div>
        )}

        {/* 공개 범위 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
            공개 범위
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPrivacy('PUBLIC')}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-[14px] font-medium transition-colors',
                privacy === 'PUBLIC'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[rgba(45,136,255,0.1)]'
                  : 'border-[var(--color-divider)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
              )}
            >
              공개
            </button>
            <button
              type="button"
              onClick={() => setPrivacy('PRIVATE')}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-[14px] font-medium transition-colors',
                privacy === 'PRIVATE'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[rgba(45,136,255,0.1)]'
                  : 'border-[var(--color-divider)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
              )}
            >
              비공개
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {createMutation.error && (
          <p className="text-[13px] text-[var(--color-error)]">
            {createMutation.error.message}
          </p>
        )}

        {/* 버튼 */}
        <Button
          type="submit"
          className="w-full"
          disabled={!name.trim() || !startDate || createMutation.isPending}
        >
          {createMutation.isPending ? '만드는 중...' : '만들기'}
        </Button>
      </form>
    </Modal>
  )
}
