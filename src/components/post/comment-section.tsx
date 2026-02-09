'use client'

import { useState } from 'react'
import { ThumbsUp, CornerDownRight } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn, formatRelativeTime } from '@/lib/utils'

interface CommentAuthor {
  id: string
  displayName: string
  avatarUrl?: string | null
  username: string
}

interface Comment {
  id: string
  content: string
  author: CommentAuthor
  likeCount: number
  replyCount: number
  depth: number
  createdAt: Date
  isEdited: boolean
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  totalCount: number
  currentUser?: {
    displayName: string
    avatarUrl?: string | null
  }
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: Comment
  onReply: (commentId: string, authorName: string) => void
}) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likeCount)
  const [showReplies, setShowReplies] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <div
      className={cn('flex gap-2', comment.depth > 0 && 'ml-10')}
    >
      <Avatar
        size={comment.depth > 0 ? 'xs' : 'sm'}
        name={comment.author.displayName}
        src={comment.author.avatarUrl ?? undefined}
      />
      <div className="flex-1 min-w-0">
        <div className="inline-block rounded-2xl bg-[var(--color-bg-input)] px-3 py-2">
          <p className="text-[13px] font-semibold leading-tight">
            {comment.author.displayName}
          </p>
          <p className="text-[15px] leading-snug mt-0.5 break-words">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <button
            onClick={handleLike}
            className={cn(
              'text-xs font-semibold hover:underline',
              isLiked
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)]'
            )}
          >
            {isLiked ? '좋아요' : '좋아요'}
          </button>
          <button
            onClick={() => onReply(comment.id, comment.author.displayName)}
            className="text-xs font-semibold text-[var(--color-text-secondary)] hover:underline"
          >
            답글
          </button>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {formatRelativeTime(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-[var(--color-text-tertiary)]">
              (수정됨)
            </span>
          )}
          {likeCount > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-xs text-[var(--color-text-secondary)]">
              <ThumbsUp size={12} className="text-[var(--color-primary)]" />
              {likeCount}
            </span>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1">
            {!showReplies && comment.replyCount > 0 && (
              <button
                onClick={() => setShowReplies(true)}
                className="flex items-center gap-1 text-[15px] font-semibold text-[var(--color-text-secondary)] hover:underline mt-1 px-1"
              >
                <CornerDownRight size={14} />
                답글 {comment.replyCount}개
              </button>
            )}
            {showReplies &&
              comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentSection({
  postId,
  comments,
  totalCount,
  currentUser,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [visibleCount, setVisibleCount] = useState(3)
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string
    authorName: string
  } | null>(null)

  const visibleComments = comments.slice(0, visibleCount)
  const hasMore = visibleCount < comments.length

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ commentId, authorName })
    setNewComment(`@${authorName} `)
  }

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newComment.trim()) {
      // TODO: tRPC comment.create mutation 연동
      setNewComment('')
      setReplyingTo(null)
    }
  }

  return (
    <div className="px-4 pb-3">
      {/* Comment input */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar
          size="xs"
          name={currentUser?.displayName ?? '사용자'}
          src={currentUser?.avatarUrl ?? undefined}
        />
        <div className="flex-1 relative">
          {replyingTo && (
            <div className="absolute -top-5 left-0 text-xs text-[var(--color-text-secondary)]">
              {replyingTo.authorName}님에게 답글 작성 중...
              <button
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment('')
                }}
                className="ml-1 text-[var(--color-primary)] hover:underline"
              >
                취소
              </button>
            </div>
          )}
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="댓글을 입력하세요..."
            className="w-full h-9 rounded-full bg-[var(--color-bg-input)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Comment list */}
      <div className="space-y-3">
        {visibleComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReply}
          />
        ))}
      </div>

      {/* Show more button */}
      {hasMore && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 5)}
          className="mt-3 text-[15px] font-semibold text-[var(--color-text-secondary)] hover:underline"
        >
          댓글 {comments.length - visibleCount}개 더 보기
        </button>
      )}
    </div>
  )
}
