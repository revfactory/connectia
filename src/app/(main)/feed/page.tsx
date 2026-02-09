'use client'

import { useCallback } from 'react'
import { CreatePostCard } from '@/components/post/create-post-card'
import { PostCard } from '@/components/post/post-card'
import { StoryRing } from '@/components/stories/story-ring'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
// import { trpc } from '@/lib/trpc'

// TODO: tRPC useInfiniteQuery 연동 후 제거
const MOCK_USER = {
  id: 'mock-user-id',
  displayName: '김민준',
  avatarUrl: null,
}

const MOCK_STORY_GROUPS = [
  {
    author: {
      id: 'mock-user-id',
      username: 'minjun',
      displayName: '김민준',
      avatarUrl: null,
      isOnline: true,
    },
    stories: [
      {
        id: 's1',
        mediaUrl: '/placeholder-story.jpg',
        mediaType: 'IMAGE',
        caption: '오늘 하루도 화이팅!',
        backgroundColor: '#1a1a2e',
        viewCount: 12,
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        hasViewed: true,
      },
    ],
    hasUnviewed: false,
  },
  {
    author: {
      id: 'u1',
      username: 'jisoo_park',
      displayName: '박지수',
      avatarUrl: null,
      isOnline: true,
    },
    stories: [
      {
        id: 's2',
        mediaUrl: '/placeholder-story.jpg',
        mediaType: 'IMAGE',
        caption: '한강에서 보는 석양',
        backgroundColor: '#e94560',
        viewCount: 34,
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        hasViewed: false,
      },
    ],
    hasUnviewed: true,
  },
  {
    author: {
      id: 'u2',
      username: 'dev_hyunwoo',
      displayName: '이현우',
      avatarUrl: null,
      isOnline: false,
    },
    stories: [
      {
        id: 's3',
        mediaUrl: '/placeholder-story.jpg',
        mediaType: 'IMAGE',
        caption: '코딩하는 주말',
        backgroundColor: '#0f3460',
        viewCount: 20,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        hasViewed: false,
      },
    ],
    hasUnviewed: true,
  },
  {
    author: {
      id: 'u3',
      username: 'soyeon_kim',
      displayName: '김소연',
      avatarUrl: null,
      isOnline: true,
    },
    stories: [
      {
        id: 's4',
        mediaUrl: '/placeholder-story.jpg',
        mediaType: 'IMAGE',
        caption: '오늘 읽은 책 추천!',
        backgroundColor: '#533483',
        viewCount: 15,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        hasViewed: true,
      },
    ],
    hasUnviewed: false,
  },
]

const MOCK_POSTS = [
  {
    id: '1',
    content:
      '오늘 날씨가 정말 좋네요! 오랜만에 한강 공원에서 산책했는데 벚꽃이 활짝 피어서 너무 예뻤어요. 역시 봄은 최고의 계절인 것 같습니다.',
    type: 'TEXT' as const,
    audience: 'PUBLIC' as const,
    mediaUrls: [],
    likeCount: 24,
    commentCount: 5,
    shareCount: 2,
    isEdited: false,
    feeling: null,
    location: '서울 한강공원',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    author: {
      id: 'u1',
      username: 'jisoo_park',
      displayName: '박지수',
      avatarUrl: null,
      isVerified: false,
    },
  },
  {
    id: '2',
    content:
      '새로운 프로젝트 시작! Next.js와 TypeScript로 소셜 네트워크를 만들고 있어요. 정말 재미있는 기술 스택이네요.',
    type: 'TEXT' as const,
    audience: 'FRIENDS' as const,
    mediaUrls: [],
    likeCount: 42,
    commentCount: 12,
    shareCount: 5,
    isEdited: true,
    feeling: '신나는',
    location: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    author: {
      id: 'u2',
      username: 'dev_hyunwoo',
      displayName: '이현우',
      avatarUrl: null,
      isVerified: true,
    },
  },
  {
    id: '3',
    content:
      '주말에 카페에서 읽은 책 추천합니다. "클린 코드"는 개발자라면 꼭 한 번 읽어봐야 할 책이에요. 코드 작성에 대한 관점이 완전히 바뀌었습니다.',
    type: 'TEXT' as const,
    audience: 'PUBLIC' as const,
    mediaUrls: [],
    likeCount: 87,
    commentCount: 23,
    shareCount: 15,
    isEdited: false,
    feeling: null,
    location: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    author: {
      id: 'u3',
      username: 'soyeon_kim',
      displayName: '김소연',
      avatarUrl: null,
      isVerified: false,
    },
  },
  {
    id: '4',
    content: '오늘 점심 맛집 발견했어요! 강남역 근처 파스타 집인데 분위기도 좋고 맛도 최고였습니다. 다음에 같이 가실 분?',
    type: 'TEXT' as const,
    audience: 'PUBLIC' as const,
    mediaUrls: [],
    likeCount: 15,
    commentCount: 8,
    shareCount: 1,
    isEdited: false,
    feeling: '행복한',
    location: '서울 강남역',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    author: {
      id: 'u4',
      username: 'junho_choi',
      displayName: '최준호',
      avatarUrl: null,
      isVerified: false,
    },
  },
  {
    id: '5',
    content:
      '드디어 마라톤 풀코스 완주했습니다! 4시간 30분이라는 기록이지만, 포기하지 않고 끝까지 달린 제 자신이 자랑스럽네요. 함께 응원해주신 모든 분들 감사합니다!',
    type: 'TEXT' as const,
    audience: 'PUBLIC' as const,
    mediaUrls: [],
    likeCount: 156,
    commentCount: 34,
    shareCount: 8,
    isEdited: false,
    feeling: '뿌듯한',
    location: '서울국제마라톤',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    author: {
      id: 'u5',
      username: 'yuna_lee',
      displayName: '이유나',
      avatarUrl: null,
      isVerified: true,
    },
  },
]

const MOCK_COMMENTS = [
  {
    id: 'c1',
    content: '정말 좋은 날씨였죠! 저도 갔었는데 사람이 엄청 많았어요.',
    author: {
      id: 'u2',
      displayName: '이현우',
      avatarUrl: null,
      username: 'dev_hyunwoo',
    },
    likeCount: 3,
    replyCount: 1,
    depth: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    isEdited: false,
    replies: [
      {
        id: 'c1r1',
        content: '맞아요! 그래도 너무 예뻤어요 ㅎㅎ',
        author: {
          id: 'u1',
          displayName: '박지수',
          avatarUrl: null,
          username: 'jisoo_park',
        },
        likeCount: 1,
        replyCount: 0,
        depth: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        isEdited: false,
      },
    ],
  },
  {
    id: 'c2',
    content: '벚꽃 사진도 찍으셨나요? 보고 싶어요!',
    author: {
      id: 'u3',
      displayName: '김소연',
      avatarUrl: null,
      username: 'soyeon_kim',
    },
    likeCount: 2,
    replyCount: 0,
    depth: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    isEdited: false,
  },
]

function PostSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 border-t border-[var(--color-divider)] pt-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </div>
    </Card>
  )
}

export default function FeedPage() {
  // TODO: tRPC 연동
  // const { data: storyGroups, isLoading: storiesLoading } =
  //   trpc.story.getFeedStories.useQuery()
  // const viewStoryMutation = trpc.story.viewStory.useMutation()

  const storyGroups = MOCK_STORY_GROUPS
  const storiesLoading = false

  const handleStoryViewed = useCallback((storyId: string) => {
    // TODO: tRPC mutation 연동
    // viewStoryMutation.mutate({ storyId })
    console.log('스토리 조회:', storyId)
  }, [])

  const handleCreateStory = useCallback(() => {
    // TODO: 스토리 생성 모달 열기
    console.log('스토리 생성')
  }, [])

  // TODO: tRPC useInfiniteQuery 연동
  // const { data, isLoading, fetchNextPage, hasNextPage } =
  //   trpc.post.getFeed.useInfiniteQuery(
  //     { limit: 20 },
  //     { getNextPageParam: (lastPage) => lastPage.nextCursor }
  //   )

  const isLoading = false
  const posts = MOCK_POSTS

  return (
    <div className="space-y-4">
      {/* 스토리 */}
      <StoryRing
        storyGroups={storyGroups}
        currentUserId={MOCK_USER.id}
        isLoading={storiesLoading}
        onCreateStory={handleCreateStory}
      />

      {/* 게시물 작성 */}
      <CreatePostCard user={MOCK_USER} />

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Posts */}
      {!isLoading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              comments={index === 0 ? MOCK_COMMENTS : []}
              currentUser={MOCK_USER}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[var(--color-text-secondary)] text-[15px]">
            아직 게시물이 없습니다. 친구를 추가하거나 그룹에 가입해보세요!
          </p>
        </Card>
      )}

      {/* TODO: 무한 스크롤 - Intersection Observer로 fetchNextPage 호출 */}
    </div>
  )
}
