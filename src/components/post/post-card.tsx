'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { cn, formatRelativeTime } from '@/lib/utils'
import { ReactionPicker, getReactionDisplay, type ReactionType } from './reaction-picker'
import { CommentSection } from './comment-section'

interface PostAuthor {
  id: string
  username: string
  displayName: string
  avatarUrl?: string | null
  isVerified?: boolean
}

interface PostComment {
  id: string
  content: string
  author: {
    id: string
    displayName: string
    avatarUrl?: string | null
    username: string
  }
  likeCount: number
  replyCount: number
  depth: number
  createdAt: Date
  isEdited: boolean
  replies?: PostComment[]
}

interface PostData {
  id: string
  content?: string | null
  type: string
  audience: string
  mediaUrls: string[]
  likeCount: number
  commentCount: number
  shareCount: number
  isEdited: boolean
  feeling?: string | null
  location?: string | null
  createdAt: Date
  author: PostAuthor
}

interface PostCardProps {
  post: PostData
  comments?: PostComment[]
  currentUser?: {
    displayName: string
    avatarUrl?: string | null
  }
}

const audienceIcons: Record<string, typeof Globe> = {
  PUBLIC: Globe,
  FRIENDS: Users,
  ONLY_ME: Lock,
}

export function PostCard({ post, comments = [], currentUser }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const AudienceIcon = audienceIcons[post.audience] ?? Globe

  const handleReaction = (type: ReactionType) => {
    if (selectedReaction === type) {
      setSelectedReaction(null)
      setLikeCount((prev) => prev - 1)
    } else {
      if (!selectedReaction) {
        setLikeCount((prev) => prev + 1)
      }
      setSelectedReaction(type)
    }
    setShowReactionPicker(false)
  }

  const handleLikeClick = () => {
    if (selectedReaction) {
      setSelectedReaction(null)
      setLikeCount((prev) => prev - 1)
    } else {
      setSelectedReaction('LIKE')
      setLikeCount((prev) => prev + 1)
    }
  }

  const reactionDisplay = selectedReaction
    ? getReactionDisplay(selectedReaction)
    : null

  return (
    <Card>
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Avatar
            size="md"
            name={post.author.displayName}
            src={post.author.avatarUrl ?? undefined}
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[15px] font-semibold hover:underline cursor-pointer">
                {post.author.displayName}
              </span>
              {post.feeling && (
                <span className="text-[15px] text-[var(--color-text-secondary)]">
                  님이 {post.feeling} 느끼는 중
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)]">
              <span className="hover:underline cursor-pointer">
                {formatRelativeTime(post.createdAt)}
              </span>
              {post.isEdited && <span>&#183; 수정됨</span>}
              <span>&#183;</span>
              <AudienceIcon size={12} />
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <MoreHorizontal size={20} className="text-[var(--color-text-secondary)]" />
          </button>
          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-[var(--color-bg-card)] shadow-[var(--shadow-dropdown)] border border-[var(--color-divider)] z-20 overflow-hidden">
              <button className="w-full px-4 py-2.5 text-left text-[15px] hover:bg-[var(--color-bg-hover)] transition-colors">
                게시물 저장
              </button>
              <button className="w-full px-4 py-2.5 text-left text-[15px] hover:bg-[var(--color-bg-hover)] transition-colors">
                게시물 숨기기
              </button>
              <button className="w-full px-4 py-2.5 text-left text-[15px] hover:bg-[var(--color-bg-hover)] transition-colors">
                신고
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-2">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>
      )}

      {/* Location */}
      {post.location && (
        <div className="px-4 pb-2">
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            - {post.location}
          </span>
        </div>
      )}

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <div
          className={cn(
            'mt-1',
            post.mediaUrls.length === 1 && 'aspect-video relative',
            post.mediaUrls.length >= 2 && 'grid gap-0.5',
            post.mediaUrls.length === 2 && 'grid-cols-2',
            post.mediaUrls.length === 3 && 'grid-cols-2',
            post.mediaUrls.length >= 4 && 'grid-cols-2'
          )}
        >
          {post.mediaUrls.slice(0, 4).map((url, index) => (
            <div
              key={index}
              className={cn(
                'relative overflow-hidden bg-[var(--color-bg-input)]',
                post.mediaUrls.length === 1 && 'w-full h-full',
                post.mediaUrls.length >= 2 && 'aspect-square',
                post.mediaUrls.length === 3 && index === 0 && 'row-span-2'
              )}
            >
              <Image
                src={url}
                alt={`게시물 이미지 ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 3 && post.mediaUrls.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-3xl font-bold text-white">
                    +{post.mediaUrls.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reaction / Comment / Share counts */}
      {(likeCount > 0 || post.commentCount > 0 || post.shareCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-1">
            {likeCount > 0 && (
              <>
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] text-white">
                  {'\uD83D\uDC4D'}
                </span>
                <span className="text-[15px] text-[var(--color-text-secondary)]">
                  {likeCount}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {post.commentCount > 0 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-[15px] text-[var(--color-text-secondary)] hover:underline"
              >
                댓글 {post.commentCount}개
              </button>
            )}
            {post.shareCount > 0 && (
              <span className="text-[15px] text-[var(--color-text-secondary)]">
                공유 {post.shareCount}회
              </span>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 border-t border-[var(--color-divider)]" />

      {/* Action buttons */}
      <div className="flex px-2 py-1">
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <AnimatePresence>
            <ReactionPicker
              isVisible={showReactionPicker}
              selectedReaction={selectedReaction}
              onSelect={handleReaction}
            />
          </AnimatePresence>
          <button
            onClick={handleLikeClick}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-md py-2 text-[15px] font-medium transition-colors hover:bg-[var(--color-bg-hover)]',
              selectedReaction
                ? reactionDisplay?.color
                : 'text-[var(--color-text-secondary)]'
            )}
          >
            {selectedReaction ? (
              <>
                <span className="text-[18px]">{reactionDisplay?.emoji}</span>
                {reactionDisplay?.label}
              </>
            ) : (
              <>
                <ThumbsUp size={20} />
                좋아요
              </>
            )}
          </button>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[15px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <MessageCircle size={20} />
          댓글
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[15px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
          <Share2 size={20} />
          공유
        </button>
      </div>

      {/* Comment section */}
      {showComments && (
        <>
          <div className="mx-4 border-t border-[var(--color-divider)]" />
          <div className="pt-3">
            <CommentSection
              postId={post.id}
              comments={comments}
              totalCount={post.commentCount}
              currentUser={currentUser}
            />
          </div>
        </>
      )}
    </Card>
  )
}
