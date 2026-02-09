'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Globe,
  Users,
  Lock,
  ChevronDown,
  Image as ImageIcon,
  Video,
  Smile,
  MapPin,
  UserPlus,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Audience = 'PUBLIC' | 'FRIENDS' | 'ONLY_ME'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    displayName: string
    avatarUrl?: string | null
  }
}

const audienceOptions: { value: Audience; label: string; icon: typeof Globe }[] = [
  { value: 'PUBLIC', label: '전체 공개', icon: Globe },
  { value: 'FRIENDS', label: '친구', icon: Users },
  { value: 'ONLY_ME', label: '나만 보기', icon: Lock },
]

export function CreatePostModal({ isOpen, onClose, user }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<Audience>('PUBLIC')
  const [isAudienceOpen, setIsAudienceOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedAudience = audienceOptions.find((o) => o.value === audience)!
  const AudienceIcon = selectedAudience.icon

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 200)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setContent('')
      setAudience('PUBLIC')
      setIsAudienceOpen(false)
    }
  }, [isOpen])

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)

    // TODO: tRPC post.create mutation 연동
    // await trpc.post.create.mutate({ content, audience })

    setTimeout(() => {
      setIsSubmitting(false)
      setContent('')
      onClose()
    }, 500)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="게시물 만들기">
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          size="sm"
          name={user.displayName}
          src={user.avatarUrl ?? undefined}
        />
        <div>
          <p className="text-[15px] font-semibold leading-tight">
            {user.displayName}
          </p>
          <div className="relative mt-1">
            <button
              onClick={() => setIsAudienceOpen(!isAudienceOpen)}
              className="flex items-center gap-1 rounded-md bg-[var(--color-bg-active)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] transition-colors"
            >
              <AudienceIcon size={12} />
              {selectedAudience.label}
              <ChevronDown size={12} />
            </button>
            {isAudienceOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 rounded-lg bg-[var(--color-bg-card)] shadow-[var(--shadow-dropdown)] border border-[var(--color-divider)] z-20 overflow-hidden">
                {audienceOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setAudience(option.value)
                        setIsAudienceOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors',
                        audience === option.value && 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[#3A3B3C]'
                      )}
                    >
                      <Icon size={16} />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextareaChange}
        placeholder={`무슨 생각을 하고 계신가요, ${user.displayName}님?`}
        className="w-full min-h-[120px] resize-none bg-transparent text-[24px] leading-relaxed placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
      />

      <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--color-divider)] px-4 py-3">
        <span className="text-[15px] font-medium">게시물에 추가</span>
        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors">
            <ImageIcon size={24} className="text-green-500" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors">
            <UserPlus size={24} className="text-[var(--color-primary)]" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors">
            <Smile size={24} className="text-yellow-500" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors">
            <MapPin size={24} className="text-red-500" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors">
            <Video size={24} className="text-red-500" />
          </button>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        className="mt-4 w-full"
        size="lg"
      >
        {isSubmitting ? '게시 중...' : '게시'}
      </Button>
    </Modal>
  )
}
