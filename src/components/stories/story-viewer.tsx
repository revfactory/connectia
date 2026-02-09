'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/avatar'
import { cn, formatRelativeTime } from '@/lib/utils'

interface StoryAuthor {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  isOnline?: boolean
}

interface StoryItem {
  id: string
  mediaUrl: string
  mediaType: string
  caption: string | null
  backgroundColor: string | null
  viewCount: number
  expiresAt: Date
  createdAt: Date
  hasViewed: boolean
}

interface StoryGroup {
  author: StoryAuthor
  stories: StoryItem[]
  hasUnviewed: boolean
}

interface StoryViewerProps {
  storyGroup: StoryGroup
  onClose: () => void
  onPrevGroup: () => void
  onNextGroup: () => void
  hasPrevGroup: boolean
  hasNextGroup: boolean
  onStoryViewed?: (storyId: string) => void
}

const STORY_DURATION = 5000 // 5초

export function StoryViewer({
  storyGroup,
  onClose,
  onPrevGroup,
  onNextGroup,
  hasPrevGroup,
  hasNextGroup,
  onStoryViewed,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const elapsedRef = useRef<number>(0)

  const currentStory = storyGroup.stories[currentIndex]
  const isVideo = currentStory?.mediaType === 'VIDEO'

  // 스토리 조회 기록
  useEffect(() => {
    if (currentStory) {
      onStoryViewed?.(currentStory.id)
    }
  }, [currentStory, onStoryViewed])

  const goToNext = useCallback(() => {
    if (currentIndex < storyGroup.stories.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setProgress(0)
      elapsedRef.current = 0
    } else if (hasNextGroup) {
      onNextGroup()
      setCurrentIndex(0)
      setProgress(0)
      elapsedRef.current = 0
    } else {
      onClose()
    }
  }, [currentIndex, storyGroup.stories.length, hasNextGroup, onNextGroup, onClose])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setProgress(0)
      elapsedRef.current = 0
    } else if (hasPrevGroup) {
      onPrevGroup()
      setCurrentIndex(0)
      setProgress(0)
      elapsedRef.current = 0
    }
  }, [currentIndex, hasPrevGroup, onPrevGroup])

  // 자동 진행 타이머
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    startTimeRef.current = Date.now()
    const remaining = STORY_DURATION - elapsedRef.current

    timerRef.current = setInterval(() => {
      const now = Date.now()
      const currentElapsed = elapsedRef.current + (now - startTimeRef.current)
      const newProgress = Math.min((currentElapsed / STORY_DURATION) * 100, 100)
      setProgress(newProgress)

      if (currentElapsed >= STORY_DURATION) {
        if (timerRef.current) clearInterval(timerRef.current)
        elapsedRef.current = 0
        goToNext()
      }
    }, 30)

    // 남은 시간 후 정리
    const timeout = setTimeout(() => {
      // goToNext가 interval 안에서 호출됨
    }, remaining)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      clearTimeout(timeout)
      elapsedRef.current =
        elapsedRef.current + (Date.now() - startTimeRef.current)
    }
  }, [currentIndex, isPaused, goToNext])

  // 스토리 변경 시 progress 리셋
  useEffect(() => {
    setProgress(0)
    elapsedRef.current = 0
    startTimeRef.current = Date.now()
  }, [currentIndex])

  // storyGroup 변경 시 리셋
  useEffect(() => {
    setCurrentIndex(0)
    setProgress(0)
    elapsedRef.current = 0
  }, [storyGroup.author.id])

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPaused((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, goToPrev, goToNext])

  // 비디오 음소거 토글
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  if (!currentStory) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>

        {/* 이전 그룹 네비게이션 */}
        {hasPrevGroup && (
          <button
            onClick={goToPrev}
            className="absolute left-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={28} className="text-white" />
          </button>
        )}

        {/* 다음 그룹 네비게이션 */}
        {(hasNextGroup || currentIndex < storyGroup.stories.length - 1) && (
          <button
            onClick={goToNext}
            className="absolute right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={28} className="text-white" />
          </button>
        )}

        {/* 스토리 컨테이너 */}
        <motion.div
          key={`${storyGroup.author.id}-${currentIndex}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-[420px] h-[calc(100vh-48px)] max-h-[760px] rounded-xl overflow-hidden"
          style={{
            backgroundColor: currentStory.backgroundColor || '#000',
          }}
        >
          {/* 진행 바 */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
            {storyGroup.stories.map((_, i) => (
              <div
                key={i}
                className="h-[2px] flex-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-white transition-none"
                  style={{
                    width:
                      i < currentIndex
                        ? '100%'
                        : i === currentIndex
                          ? `${progress}%`
                          : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* 상단 작성자 정보 */}
          <div className="absolute top-5 left-0 right-0 z-20 flex items-center justify-between px-3 pt-2">
            <div className="flex items-center gap-2">
              <Avatar
                size="sm"
                name={storyGroup.author.displayName}
                src={storyGroup.author.avatarUrl}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white drop-shadow-md">
                  {storyGroup.author.displayName}
                </span>
                <span className="text-xs text-white/70 drop-shadow-md">
                  {formatRelativeTime(new Date(currentStory.createdAt))}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* 일시정지/재생 토글 */}
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                {isPaused ? (
                  <Play size={16} className="text-white" />
                ) : (
                  <Pause size={16} className="text-white" />
                )}
              </button>
              {/* 비디오 음소거 토글 */}
              {isVideo && (
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX size={16} className="text-white" />
                  ) : (
                    <Volume2 size={16} className="text-white" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 미디어 콘텐츠 */}
          <div
            className="relative h-full w-full flex items-center justify-center"
            onClick={(e) => {
              // 좌측 클릭: 이전, 우측 클릭: 다음
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              if (x < rect.width / 3) {
                goToPrev()
              } else if (x > (rect.width * 2) / 3) {
                goToNext()
              }
            }}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentStory.mediaUrl}
                className="h-full w-full object-contain"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              />
            ) : (
              <Image
                src={currentStory.mediaUrl}
                alt={currentStory.caption || '스토리'}
                fill
                className="object-contain"
                priority
              />
            )}
          </div>

          {/* 하단 캡션 */}
          {currentStory.caption && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-4 pb-6 pt-12">
              <p className="text-sm text-white leading-relaxed drop-shadow-md">
                {currentStory.caption}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
