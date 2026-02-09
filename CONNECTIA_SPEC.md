<project_specification>

<project_name>Connectia - Facebook-style Social Networking Platform</project_name>

<overview>
Connectia는 페이스북과 유사한 대규모 소셜 네트워킹 플랫폼입니다. 사용자들이 프로필을 생성하고, 친구를 맺고, 뉴스피드를 통해 게시물을 공유하며, 실시간 메시징으로 소통할 수 있는 풀스택 웹 애플리케이션입니다. 모든 연령대의 일반 대중을 대상으로 하며, 직관적이고 접근성 높은 UI를 제공합니다.

핵심 사용자 워크플로우는 다음과 같습니다: (1) 회원가입/로그인 후 프로필 설정, (2) 친구 검색 및 요청/수락, (3) 뉴스피드에서 텍스트/이미지/동영상 게시물 작성 및 탐색, (4) 좋아요/댓글/공유를 통한 상호작용, (5) 1:1 및 그룹 실시간 메시징, (6) 알림을 통한 활동 추적. 추가로 스토리(24시간 임시 게시물), 이벤트, 그룹 기능을 포함합니다.

CRITICAL: 프로덕션급 대규모 서비스로 설계합니다. 수백만 동시 사용자를 지원하는 확장 가능한 아키텍처가 필요합니다. 모든 사용자 데이터는 암호화되어야 하며 GDPR 준수가 필수입니다. 실시간 기능(메시징, 알림)은 WebSocket 기반으로 구현하며, 이미지/동영상 업로드는 CDN을 통해 최적화합니다. Rate limiting, CSRF/XSS 방어, 입력 검증 등 보안 레이어가 반드시 포함되어야 합니다.
</overview>

<technology_stack>
  <frontend_application>
    <framework>Next.js 14.2 (App Router) with TypeScript 5.4 - 서버 사이드 렌더링 및 정적 생성 지원</framework>
    <build_tool>Turbopack (Next.js 내장) - 빠른 개발 빌드</build_tool>
    <styling>Tailwind CSS 3.4.1 + shadcn/ui 0.8 - 유틸리티 기반 스타일링 및 접근성 높은 컴포넌트</styling>
    <routing>Next.js App Router (파일 기반 라우팅) - 병렬 라우트, 인터셉팅 라우트 지원</routing>
    <state_management>Zustand 4.5 (클라이언트 상태) + TanStack Query 5.28 (서버 상태) - 가볍고 효율적인 상태 관리</state_management>
    <form_handling>React Hook Form 7.51 + Zod 3.22 - 폼 검증 및 타입 안전 스키마</form_handling>
    <realtime_client>Socket.IO Client 4.7 - WebSocket 기반 실시간 통신</realtime_client>
  </frontend_application>

  <backend>
    <runtime>Node.js 20 LTS</runtime>
    <framework>Next.js 14.2 API Routes (Route Handlers) + tRPC 10.45 - 타입 안전 API 레이어</framework>
    <auth>NextAuth.js 5.0 (Auth.js) - OAuth 2.0 (Google, Kakao, Apple), 이메일/비밀번호, 매직링크</auth>
    <api_style>tRPC (타입 안전 RPC) + REST API (외부 통합용)</api_style>
    <realtime_server>Socket.IO 4.7 - 커스텀 Node.js 서버 연동</realtime_server>
    <file_upload>UploadThing 6.12 또는 AWS S3 SDK 3.x - 이미지/동영상 업로드 및 CDN 연동</file_upload>
    <email>Resend 3.2 - 트랜잭셔널 이메일 (인증, 알림)</email>
    <job_queue>BullMQ 5.4 + Redis - 백그라운드 작업 처리 (이메일, 알림, 피드 생성)</job_queue>
  </backend>

  <data_layer>
    <primary_database>PostgreSQL 16 - 관계형 데이터, 사용자/게시물/관계</primary_database>
    <orm>Prisma 5.11 - 타입 안전 ORM, 마이그레이션 관리</orm>
    <cache>Redis 7.2 - 세션, 캐시, 실시간 상태, 피드 캐시</cache>
    <search>Meilisearch 1.7 - 사용자/게시물 전문 검색 (빠른 typo-tolerant 검색)</search>
    <file_storage>AWS S3 또는 Cloudflare R2 - 미디어 파일 저장</file_storage>
    <cdn>Cloudflare CDN - 정적 자산 및 미디어 파일 배포</cdn>
    <note>CRITICAL: 모든 민감한 데이터는 at-rest 및 in-transit 암호화 필수. 비밀번호는 bcrypt(salt rounds: 12)로 해시. PII 데이터는 별도 암호화 컬럼 사용.</note>
  </data_layer>

  <infrastructure>
    <hosting>Vercel (Next.js) + AWS EC2/ECS (Socket.IO 서버, BullMQ Worker)</hosting>
    <container>Docker + Docker Compose (로컬 개발) / Kubernetes (프로덕션)</container>
    <ci_cd>GitHub Actions - 린트, 테스트, 빌드, 배포 자동화</ci_cd>
    <monitoring>Sentry 7.x (에러 트래킹) + Grafana/Prometheus (메트릭) + Vercel Analytics</monitoring>
    <logging>Pino 8.x (구조화된 JSON 로깅) + Logflare 또는 Datadog</logging>
  </infrastructure>

  <libraries>
    <ui_icons>Lucide React 0.363 - 일관된 아이콘 시스템</ui_icons>
    <date>date-fns 3.6 - 날짜 포매팅 및 상대 시간 표시</date>
    <image_processing>Sharp 0.33 - 서버 사이드 이미지 리사이징 및 최적화</image_processing>
    <rich_text>Tiptap 2.3 - 게시물/댓글 리치 텍스트 에디터</rich_text>
    <video_player>Video.js 8.10 - 동영상 재생</video_player>
    <virtual_scroll>@tanstack/react-virtual 3.2 - 대량 리스트 가상 스크롤</virtual_scroll>
    <emoji>emoji-mart 5.6 - 이모지 피커</emoji>
    <crop>react-image-crop 11.0 - 프로필/커버 이미지 크롭</crop>
    <animation>Framer Motion 11.0 - UI 애니메이션 및 트랜지션</animation>
    <charts>Recharts 2.12 - 관리자 대시보드 차트</charts>
    <rate_limit>rate-limiter-flexible 5.0 - API Rate Limiting</rate_limit>
    <sanitize>DOMPurify 3.0 + isomorphic-dompurify - XSS 방지 HTML 새니타이징</sanitize>
  </libraries>
</technology_stack>

<prerequisites>
  <environment_setup>
    - Node.js 20 LTS
    - pnpm 8.15+ (패키지 매니저)
    - PostgreSQL 16
    - Redis 7.2
    - Docker Desktop (로컬 개발용)
    - Meilisearch 1.7 (Docker로 실행)
    - AWS CLI 2.x (S3 접근용) 또는 Cloudflare Wrangler
  </environment_setup>

  <build_configuration>
    - TypeScript strict mode 활성화
    - ESLint + Prettier (코드 품질)
    - Husky + lint-staged (커밋 전 린트/포맷)
    - .env.local 파일: DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, S3_BUCKET, MEILISEARCH_HOST, SMTP_KEY
    - Prisma 스키마: prisma/schema.prisma
    - Docker Compose: PostgreSQL + Redis + Meilisearch 로컬 인스턴스
    - next.config.js: 이미지 도메인 화이트리스트, 보안 헤더
  </build_configuration>

  <third_party_accounts>
    - OAuth 프로바이더: Google Cloud Console, Kakao Developers, Apple Developer
    - AWS 계정 (S3, CloudFront) 또는 Cloudflare 계정 (R2, CDN)
    - Resend 계정 (이메일 발송)
    - Sentry 계정 (에러 트래킹)
    - Vercel 계정 (배포)
  </third_party_accounts>
</prerequisites>

<core_data_entities>
  <user>
    - id: string (uuid, PK)
    - email: string (unique, required, max 255)
    - emailVerified: DateTime (nullable)
    - passwordHash: string (nullable - OAuth 사용자는 null)
    - username: string (unique, required, 3-30자, 영문/숫자/언더스코어만)
    - displayName: string (required, max 50)
    - bio: string (nullable, max 500)
    - avatarUrl: string (nullable, S3 URL)
    - coverImageUrl: string (nullable, S3 URL)
    - dateOfBirth: Date (nullable)
    - gender: enum (male, female, other, prefer_not_to_say)
    - location: string (nullable, max 100)
    - website: string (nullable, max 200)
    - phone: string (nullable, encrypted)
    - isVerified: boolean (default false - 공인 계정 인증)
    - isPrivate: boolean (default false)
    - isOnline: boolean (default false)
    - lastSeenAt: DateTime
    - role: enum (user, moderator, admin)
    - privacySettings: JSON (friendListVisibility, postDefaultAudience, profileVisibility, searchable)
    - notificationSettings: JSON (email, push, inApp - 각 카테고리별 on/off)
    - createdAt: DateTime
    - updatedAt: DateTime
    - deletedAt: DateTime (nullable, soft delete)
    Indexes: [email], [username], [createdAt], [isOnline]
  </user>

  <friendship>
    - id: string (uuid, PK)
    - requesterId: string (FK → User.id, required)
    - addresseeId: string (FK → User.id, required)
    - status: enum (pending, accepted, declined, blocked)
    - createdAt: DateTime
    - updatedAt: DateTime
    Indexes: [requesterId+addresseeId] (unique), [addresseeId+status], [requesterId+status]
    Constraint: requesterId ≠ addresseeId
  </friendship>

  <post>
    - id: string (uuid, PK)
    - authorId: string (FK → User.id, required)
    - content: string (nullable, max 10000 - 리치 텍스트 HTML)
    - contentPlainText: string (nullable - 검색용 평문)
    - type: enum (text, image, video, link, shared, story)
    - audience: enum (public, friends, only_me, custom)
    - customAudienceIds: string[] (audience가 custom일 때 허용된 사용자 ID 목록)
    - mediaUrls: JSON[] (array of {url, type, width, height, thumbnailUrl, altText})
    - linkPreview: JSON (nullable - {url, title, description, imageUrl, siteName})
    - sharedPostId: string (nullable, FK → Post.id - 공유한 원본 게시물)
    - feeling: string (nullable, max 50 - "행복해요", "슬퍼요" 등)
    - location: string (nullable, max 200)
    - taggedUserIds: string[] (태그된 사용자 목록)
    - likeCount: number (default 0, denormalized)
    - commentCount: number (default 0, denormalized)
    - shareCount: number (default 0, denormalized)
    - isEdited: boolean (default false)
    - isPinned: boolean (default false)
    - expiresAt: DateTime (nullable - 스토리일 경우 24시간 후)
    - createdAt: DateTime
    - updatedAt: DateTime
    - deletedAt: DateTime (nullable, soft delete)
    Indexes: [authorId+createdAt], [type+createdAt], [audience+createdAt], [expiresAt]
  </post>

  <comment>
    - id: string (uuid, PK)
    - postId: string (FK → Post.id, required)
    - authorId: string (FK → User.id, required)
    - parentCommentId: string (nullable, FK → Comment.id - 대댓글)
    - content: string (required, max 5000 - 리치 텍스트)
    - mediaUrl: string (nullable - 이미지/GIF 첨부)
    - likeCount: number (default 0, denormalized)
    - replyCount: number (default 0, denormalized)
    - depth: number (default 0, max 3 - 대댓글 깊이 제한)
    - isEdited: boolean (default false)
    - createdAt: DateTime
    - updatedAt: DateTime
    - deletedAt: DateTime (nullable, soft delete)
    Indexes: [postId+createdAt], [parentCommentId+createdAt], [authorId+createdAt]
  </comment>

  <reaction>
    - id: string (uuid, PK)
    - userId: string (FK → User.id, required)
    - targetId: string (required - Post.id 또는 Comment.id)
    - targetType: enum (post, comment)
    - type: enum (like, love, haha, wow, sad, angry)
    - createdAt: DateTime
    Indexes: [userId+targetId+targetType] (unique), [targetId+targetType+type]
  </reaction>

  <conversation>
    - id: string (uuid, PK)
    - type: enum (direct, group)
    - name: string (nullable, max 100 - 그룹 채팅 이름)
    - avatarUrl: string (nullable - 그룹 채팅 아바타)
    - creatorId: string (FK → User.id)
    - lastMessageId: string (nullable, FK → Message.id)
    - lastMessageAt: DateTime
    - memberCount: number (default 2)
    - createdAt: DateTime
    - updatedAt: DateTime
    Indexes: [lastMessageAt DESC]
  </conversation>

  <conversation_member>
    - id: string (uuid, PK)
    - conversationId: string (FK → Conversation.id, required)
    - userId: string (FK → User.id, required)
    - role: enum (member, admin)
    - nickname: string (nullable, max 50)
    - lastReadMessageId: string (nullable, FK → Message.id)
    - isMuted: boolean (default false)
    - joinedAt: DateTime
    - leftAt: DateTime (nullable)
    Indexes: [conversationId+userId] (unique), [userId+leftAt]
  </conversation_member>

  <message>
    - id: string (uuid, PK)
    - conversationId: string (FK → Conversation.id, required)
    - senderId: string (FK → User.id, required)
    - content: string (nullable, max 10000)
    - type: enum (text, image, video, file, audio, system, emoji, reply)
    - mediaUrl: string (nullable)
    - replyToMessageId: string (nullable, FK → Message.id)
    - readBy: JSON[] (array of {userId, readAt})
    - isEdited: boolean (default false)
    - createdAt: DateTime
    - updatedAt: DateTime
    - deletedAt: DateTime (nullable, soft delete)
    Indexes: [conversationId+createdAt], [senderId+createdAt]
  </message>

  <notification>
    - id: string (uuid, PK)
    - recipientId: string (FK → User.id, required)
    - actorId: string (FK → User.id, required)
    - type: enum (friend_request, friend_accepted, post_like, post_comment, comment_reply, comment_like, post_share, post_tag, group_invite, event_invite, birthday, system)
    - targetId: string (nullable - 관련 엔티티 ID)
    - targetType: enum (post, comment, friendship, group, event, user)
    - message: string (max 500)
    - isRead: boolean (default false)
    - createdAt: DateTime
    Indexes: [recipientId+isRead+createdAt DESC], [recipientId+createdAt DESC]
  </notification>

  <group>
    - id: string (uuid, PK)
    - name: string (required, max 100)
    - description: string (nullable, max 2000)
    - coverImageUrl: string (nullable)
    - avatarUrl: string (nullable)
    - privacy: enum (public, private, secret)
    - creatorId: string (FK → User.id)
    - memberCount: number (default 1, denormalized)
    - postCount: number (default 0, denormalized)
    - rules: string (nullable, max 5000)
    - createdAt: DateTime
    - updatedAt: DateTime
    Indexes: [name], [privacy+memberCount DESC], [creatorId]
  </group>

  <group_member>
    - id: string (uuid, PK)
    - groupId: string (FK → Group.id, required)
    - userId: string (FK → User.id, required)
    - role: enum (member, moderator, admin)
    - joinedAt: DateTime
    - leftAt: DateTime (nullable)
    Indexes: [groupId+userId] (unique), [userId+leftAt]
  </group_member>

  <event>
    - id: string (uuid, PK)
    - name: string (required, max 200)
    - description: string (nullable, max 5000)
    - coverImageUrl: string (nullable)
    - startDate: DateTime (required)
    - endDate: DateTime (nullable)
    - location: string (nullable, max 300)
    - isOnline: boolean (default false)
    - onlineUrl: string (nullable)
    - privacy: enum (public, private)
    - hostId: string (FK → User.id)
    - groupId: string (nullable, FK → Group.id)
    - attendeeCount: number (default 0, denormalized)
    - interestedCount: number (default 0, denormalized)
    - createdAt: DateTime
    - updatedAt: DateTime
    Indexes: [startDate], [hostId+startDate], [groupId+startDate]
  </event>

  <event_attendee>
    - id: string (uuid, PK)
    - eventId: string (FK → Event.id, required)
    - userId: string (FK → User.id, required)
    - status: enum (going, interested, not_going)
    - createdAt: DateTime
    Indexes: [eventId+userId] (unique), [userId+status]
  </event_attendee>

  <story>
    - id: string (uuid, PK)
    - authorId: string (FK → User.id, required)
    - mediaUrl: string (required)
    - mediaType: enum (image, video)
    - caption: string (nullable, max 500)
    - backgroundColor: string (nullable, hex color - 텍스트 스토리 배경)
    - viewCount: number (default 0)
    - expiresAt: DateTime (required, createdAt + 24시간)
    - createdAt: DateTime
    Indexes: [authorId+createdAt], [expiresAt]
  </story>

  <story_view>
    - id: string (uuid, PK)
    - storyId: string (FK → Story.id, required)
    - viewerId: string (FK → User.id, required)
    - viewedAt: DateTime
    Indexes: [storyId+viewerId] (unique), [storyId+viewedAt]
  </story_view>

  <report>
    - id: string (uuid, PK)
    - reporterId: string (FK → User.id, required)
    - targetId: string (required)
    - targetType: enum (user, post, comment, message, group)
    - reason: enum (spam, harassment, hate_speech, violence, nudity, misinformation, other)
    - description: string (nullable, max 1000)
    - status: enum (pending, reviewed, resolved, dismissed)
    - reviewedBy: string (nullable, FK → User.id)
    - createdAt: DateTime
    - updatedAt: DateTime
    Indexes: [status+createdAt], [targetId+targetType], [reporterId+createdAt]
  </report>
</core_data_entities>

<pages_and_interfaces>
  <global_layout>
    <top_navigation>
      - 높이: 56px, 배경: #FFFFFF, 하단 border: 1px solid #E4E6EB
      - 좌측: 로고 (Connectia, 28px 폰트, #1877F2), 검색바 (240px → 포커스 시 400px, 배경 #F0F2F5, border-radius 20px, 높이 40px)
      - 중앙: 네비게이션 탭 (홈, 친구, 그룹, 마켓플레이스, 이벤트) - 각 탭 아이콘 24px, 하단 활성 표시 3px #1877F2 바
      - 우측: 메시지 아이콘 (뱃지), 알림 벨 아이콘 (뱃지), 프로필 아바타 (36px 원형) + 드롭다운 메뉴
      - 고정 위치 (sticky top), z-index: 100
      - 스크롤 시 box-shadow: 0 2px 4px rgba(0,0,0,0.1) 추가
    </top_navigation>

    <sidebar_left>
      - 너비: 280px, 고정 위치 (sticky), top: 56px, 높이: calc(100vh - 56px), 오버플로우 스크롤
      - 항목: 프로필 바로가기, 뉴스피드, 친구, 그룹, 마켓플레이스, 이벤트, 저장됨, 추억
      - 각 항목: 높이 44px, 패딩 8px 12px, 호버 배경 #F0F2F5, border-radius 8px
      - 프로필 항목: 아바타 28px + 이름 (font 15px, weight 600)
      - 나머지 항목: 아이콘 28px (컬러 아이콘) + 레이블 (font 15px, weight 500)
      - 하단: "더 보기" 확장 토글
    </sidebar_left>

    <main_content>
      - 최대 너비: 680px, 중앙 정렬
      - 좌우 사이드바 사이 배치
      - 배경: #F0F2F5
      - 패딩: 24px 0
    </main_content>

    <sidebar_right>
      - 너비: 280px, 고정 위치 (sticky), top: 56px
      - 콘텐츠: 스폰서 광고 영역, 생일 알림, 온라인 친구 목록
      - 온라인 친구: 초록 점(8px) + 아바타(28px) + 이름, 클릭 시 메시지 창 열기
      - 구분선: 1px solid #CED0D4, margin 12px 0
    </sidebar_right>

    <responsive_breakpoints>
      - 1280px 이상: 좌우 사이드바 모두 표시
      - 900px-1279px: 좌측 사이드바 숨김, 우측 사이드바 숨김, 메인 콘텐츠 전체 너비
      - 768px 이하: 하단 네비게이션 바로 전환, 상단 바 간소화
      - 480px 이하: 모바일 최적화, 카드 좌우 마진 제거
    </responsive_breakpoints>
  </global_layout>

  <newsfeed_view>
    <story_bar>
      - 높이: 200px, 수평 스크롤, gap 8px, 패딩 16px 0
      - 첫 번째 카드: "스토리 만들기" (+ 아이콘, 내 아바타 배경)
      - 스토리 카드: 너비 112px, 높이 200px, border-radius 12px, overflow hidden
      - 카드 콘텐츠: 배경 이미지 (그래디언트 오버레이), 좌상단 아바타 (32px, 3px #1877F2 테두리), 하단 이름 (12px, white, weight 600)
      - 미확인 스토리: 아바타 테두리 #1877F2, 확인된 스토리: 테두리 #CED0D4
      - 호버: scale(1.02), transition 150ms ease
    </story_bar>

    <create_post_card>
      - 배경: #FFFFFF, border-radius 8px, padding 16px, box-shadow: 0 1px 2px rgba(0,0,0,0.1)
      - 상단 행: 아바타 (40px 원형) + 입력 플레이스홀더 ("무슨 생각을 하고 계신가요, {이름}님?", 배경 #F0F2F5, border-radius 20px, 높이 40px, font 17px, color #65676B)
      - 하단 행: 구분선 1px + 액션 버튼 3개 (라이브 방송 - 빨강, 사진/동영상 - 초록, 기분/활동 - 노랑) - 각 아이콘 24px + 레이블
      - 클릭 시 게시물 작성 모달 열기
    </create_post_card>

    <post_card>
      - 배경: #FFFFFF, border-radius 8px, margin-bottom 16px, box-shadow: 0 1px 2px rgba(0,0,0,0.1)
      - 헤더: 아바타 (40px) + 이름 (15px, weight 600) + 시간 (13px, #65676B, 상대시간) + 공개범위 아이콘 + ··· 메뉴 버튼
      - 콘텐츠: 텍스트 (15px, line-height 1.34, 최대 5줄 후 "더 보기"), 미디어 그리드
      - 미디어 그리드 레이아웃:
        - 1장: 전체 너비, max-height 500px
        - 2장: 2열 그리드, gap 2px
        - 3장: 좌측 큰 이미지 + 우측 2개 세로 스택
        - 4장: 2x2 그리드
        - 5장 이상: 2x2 + 마지막에 "+N" 오버레이 (배경 rgba(0,0,0,0.4), 폰트 24px white)
      - 좋아요/댓글/공유 카운트 행: 패딩 10px 16px, font 15px, color #65676B
        - 좋아요: 이모지 아이콘(18px) + "N명" (호버 시 이름 리스트 툴팁)
        - 댓글/공유: "댓글 N개", "공유 N회"
      - 액션 버튼 행: 구분선 + 좋아요/댓글/공유 버튼 (각 균등 분할, 높이 44px, 호버 배경 #F0F2F5)
        - 좋아요 버튼: 길게 누르면 리액션 피커 (6개 이모지: 좋아요, 사랑해요, 하하, 와우, 슬퍼요, 화나요)
        - 리액션 피커: 높이 48px, 각 이모지 40px, 호버 시 scale(1.3) + 레이블 표시, 배경 white, shadow, border-radius 24px
      - 댓글 섹션: 처음 2개 표시, "댓글 더 보기" 버튼
      - 각 댓글: 아바타 (32px) + 댓글 버블 (배경 #F0F2F5, border-radius 18px, padding 8px 12px) + 좋아요/답글 링크 (12px)
      - 댓글 입력: 아바타 (32px) + 입력칸 (배경 #F0F2F5, border-radius 20px, 이모지/이미지/GIF 버튼)
    </post_card>

    <post_creation_modal>
      - 배경 오버레이: rgba(255,255,255,0.8), backdrop-filter blur(4px)
      - 모달: 너비 500px, 배경 #FFFFFF, border-radius 12px, box-shadow: 0 12px 28px rgba(0,0,0,0.25)
      - 헤더: "게시물 만들기" (20px, weight 700, 중앙) + 닫기 X 버튼
      - 프로필 행: 아바타 (40px) + 이름 + 공개범위 드롭다운 (아이콘 + 레이블, 배경 #E4E6EB, border-radius 6px)
      - 텍스트 영역: 최소 높이 150px, 콘텐츠에 따라 확장, placeholder "무슨 생각을 하고 계신가요?", font 24px (짧은 텍스트) / 15px (긴 텍스트)
      - 배경 색상 선택: 8가지 그래디언트 프리셋 (원형 32px 버튼)
      - 미디어 첨부 영역: 드래그&드롭 존, 격자형 미리보기, 개별 삭제 X 버튼
      - 하단 추가 옵션: "게시물에 추가" (사진/동영상, 사람 태그, 기분/활동, 위치, GIF)
      - 게시 버튼: 너비 100%, 높이 36px, 배경 #1877F2, 색상 white, border-radius 6px, disabled 상태: opacity 0.5
    </post_creation_modal>

    <infinite_scroll>
      - 하단 200px 도달 시 다음 페이지 자동 로드
      - 로딩: 스켈레톤 카드 3개 (펄스 애니메이션, 200ms)
      - 에러 시: "피드를 불러올 수 없습니다" + 재시도 버튼
      - 빈 상태: "아직 게시물이 없습니다. 친구를 추가하거나 그룹에 가입해보세요!" + 친구 추천 위젯
    </infinite_scroll>
  </newsfeed_view>

  <profile_view>
    <cover_section>
      - 높이: 350px (데스크톱), 200px (모바일)
      - 커버 이미지: 전체 너비, object-fit cover, 호버 시 "커버 사진 수정" 버튼 표시
      - 프로필 아바타: 168px 원형, 4px white 테두리, 위치: 커버 이미지 하단 좌측 겹침 (bottom: -40px)
      - 내 프로필일 때: 아바타 호버 시 카메라 아이콘 오버레이
    </cover_section>

    <profile_info>
      - 이름: 32px, weight 800
      - 친구 수: 15px, #65676B, "친구 N명" + 공통 친구 아바타 스택 (최대 6개, 28px, 겹침 -8px)
      - 바이오: 15px, max-width 680px
      - 액션 버튼: 내 프로필 → "프로필 수정" / 타인 → "친구 추가", "메시지 보내기", ··· 메뉴
    </profile_info>

    <profile_tabs>
      - 탭: 게시물, 소개, 친구, 사진, 동영상, 더 보기(체크인, 이벤트)
      - 활성 탭: 하단 border 3px #1877F2, font weight 600, color #1877F2
      - 비활성 탭: color #65676B, 호버 배경 #F0F2F5
    </profile_tabs>

    <profile_posts_tab>
      - 좌측: 소개 요약 카드, 사진 카드(최근 9장 3x3 그리드), 친구 카드(최근 9명)
      - 우측: 게시물 작성 카드 + 게시물 피드 (뉴스피드와 동일 포맷)
      - 2열 레이아웃: 좌 360px + 우 나머지, gap 16px
    </profile_posts_tab>

    <profile_about_tab>
      - 섹션: 직장 및 학력, 거주지, 연락처 및 기본 정보, 가족 및 관계, 상세 소개
      - 각 항목: 아이콘(20px) + 레이블 + 값 + 편집 아이콘(내 프로필)
      - 빈 항목: "추가하기" 링크 (#1877F2)
    </profile_about_tab>

    <profile_friends_tab>
      - 검색바: 상단, 배경 #F0F2F5
      - 친구 그리드: 2열, 각 카드 아바타(80px) + 이름 + 공통 친구 N명 + ··· 메뉴
    </profile_friends_tab>

    <profile_photos_tab>
      - 3열 그리드, gap 4px, 호버 시 어둡게 오버레이
      - 클릭 시 라이트박스 (좌우 네비게이션, 댓글 사이드 패널)
    </profile_photos_tab>

    <empty_state>
      - 비공개 프로필: 자물쇠 아이콘(48px) + "이 프로필은 비공개입니다" + "친구 요청을 보내세요"
      - 게시물 없음: "아직 게시물이 없습니다"
      - 차단된 사용자: "이 콘텐츠를 볼 수 없습니다"
    </empty_state>
  </profile_view>

  <friends_view>
    <friends_sidebar>
      - 좌측 패널: 너비 360px, 배경 #FFFFFF
      - 메뉴: 홈, 친구 요청, 제안, 모든 친구, 생일
      - 각 메뉴: 높이 52px, 아이콘(36px 원형 배경) + 레이블
    </friends_sidebar>

    <friend_requests_section>
      - 카드: 아바타(80px) + 이름 + 공통 친구 N명 + 수락/삭제 버튼
      - 수락: 배경 #1877F2, 색상 white
      - 삭제: 배경 #E4E6EB, 색상 #050505
      - 요청 없을 때: "새로운 친구 요청이 없습니다" + 일러스트
    </friend_requests_section>

    <friend_suggestions_section>
      - 카드 그리드: 2열
      - 각 카드: 아바타(80px) + 이름 + 공통 친구 N명 + "친구 추가" / "삭제" 버튼
      - 추천 알고리즘: 공통 친구 수 기반 (나중에 ML 확장)
    </friend_suggestions_section>
  </friends_view>

  <messenger_view>
    <conversation_list>
      - 좌측 패널: 너비 360px, 높이 100vh - 56px
      - 상단: "채팅" 타이틀(24px, weight 700) + 새 대화 아이콘 + 검색바
      - 대화 항목: 높이 68px, 아바타(48px) + 이름(15px, weight 600 미읽음/400 읽음) + 마지막 메시지(13px, #65676B, 1줄 말줄임) + 시간(12px) + 미읽음 뱃지(18px 원형, 배경 #1877F2)
      - 활성 대화: 배경 #EBF5FF
      - 온라인 표시: 아바타 우하단 초록 점 (12px, #31A24C)
    </conversation_list>

    <chat_window>
      - 우측 나머지 너비, 높이 100vh - 56px
      - 헤더: 아바타(32px) + 이름(15px, weight 600) + 온라인 상태("활동 중" 또는 "N분 전") + 전화/영상통화/정보 아이콘
      - 메시지 영역: 스크롤, 패딩 12px
        - 내 메시지: 우측 정렬, 배경 #0084FF, 색상 white, border-radius 18px, padding 8px 12px, max-width 65%
        - 상대 메시지: 좌측 정렬, 배경 #E4E6EB, 색상 #050505, border-radius 18px
        - 연속 메시지: border-radius 조정 (첫 번째: top-radius만, 마지막: bottom-radius만)
        - 이미지: border-radius 18px, max-width 300px, 클릭 시 라이트박스
        - 시간 구분: "오전 10:30", "어제", "2월 7일" (중앙 정렬, 12px, #65676B)
        - 읽음 표시: 하단 우측 작은 아바타(14px)
        - 타이핑 인디케이터: 아바타 + 점 3개 애니메이션 (bounce, 400ms 딜레이)
      - 입력 영역: 높이 52px(기본), 자동 확장
        - 좌측: + 버튼 (파일/이미지/GIF/스티커 첨부), 이모지 버튼
        - 중앙: 입력칸 (배경 #F0F2F5, border-radius 20px, placeholder "Aa")
        - 우측: 전송 버튼 (#0084FF 아이콘, 텍스트 비었을 때 좋아요 아이콘)
    </chat_window>

    <floating_chat_heads>
      - 우하단 위치, 최대 3개 동시 표시
      - 미니 채팅 창: 너비 328px, 높이 455px, border-radius 8px 8px 0 0
      - 접힌 상태: 헤더만 표시 (높이 40px)
      - 헤더: 아바타(24px) + 이름 + 최소화/닫기 아이콘
    </floating_chat_heads>
  </messenger_view>

  <groups_view>
    <groups_feed>
      - 좌측 패널: 그룹 메뉴 (피드, 내 그룹, 발견, 만들기)
      - 메인: 가입한 그룹의 게시물 피드 (그룹 이름 + 작성자 표시)
    </groups_feed>

    <group_detail_view>
      - 커버 이미지: 높이 300px
      - 그룹 정보: 이름(28px, weight 800) + 공개범위 + 멤버 수 + "가입하기"/"게시물 작성" 버튼
      - 탭: 토론, 멤버, 미디어, 파일, 이벤트
      - 관리자: 멤버 관리, 승인 대기 게시물, 규칙 편집
    </group_detail_view>

    <group_creation_modal>
      - 그룹 이름, 공개범위 선택, 설명, 커버 이미지 업로드
      - 초대할 친구 검색/선택
    </group_creation_modal>
  </groups_view>

  <events_view>
    <events_feed>
      - 좌측 패널: 이벤트 메뉴 (다가오는 이벤트, 내 이벤트, 발견, 만들기, 생일)
      - 메인: 이벤트 카드 리스트
      - 이벤트 카드: 커버 이미지(200px) + 날짜 배지(좌상단) + 이름 + 위치 + 참여자 수 + "관심 있음"/"참여" 버튼
    </events_feed>

    <event_detail_view>
      - 커버 이미지: 높이 350px
      - 이벤트 정보: 날짜/시간, 위치(지도 미리보기), 호스트, 설명
      - 참여 버튼: "참여", "관심 있음", "참여 안 함"
      - 토론 피드: 이벤트 관련 게시물
      - 참여자 목록: 아바타 그리드
    </event_detail_view>
  </events_view>

  <notification_panel>
    - 트리거: 상단 바 벨 아이콘 클릭
    - 패널: 너비 360px, max-height 80vh, 우측 정렬, 배경 #FFFFFF, border-radius 8px, shadow
    - 헤더: "알림" (20px, weight 700) + "모두 읽음" 링크
    - 알림 항목: 높이 auto (min 76px), 아바타(56px) + 텍스트(14px, 액터 이름 bold) + 시간(12px, #65676B) + ··· 메뉴
    - 미읽음: 배경 #EBF5FF, 좌측 청색 점(8px)
    - 읽음: 배경 #FFFFFF
    - 호버: 배경 #F0F2F5
    - 카테고리 필터: "전체", "미읽음"
    - 빈 상태: "새로운 알림이 없습니다" + 일러스트
    - 무한 스크롤: 스크롤 시 이전 알림 로드
  </notification_panel>

  <search_view>
    <search_overlay>
      - 상단 바 검색 입력 포커스 시 확장
      - 최근 검색: 아바타/아이콘 + 텍스트 + X 삭제
      - 실시간 자동완성: 사용자, 그룹, 이벤트, 게시물
      - 디바운싱: 300ms
    </search_overlay>

    <search_results_page>
      - 좌측 필터: 전체, 사람, 게시물, 그룹, 이벤트, 사진, 동영상
      - 메인: 필터별 결과 카드
      - 사람 결과: 아바타 + 이름 + 공통 친구 + "친구 추가"
      - 게시물 결과: 게시물 카드 (검색어 하이라이트)
      - 결과 없음: "'{검색어}'에 대한 결과를 찾을 수 없습니다" + 제안
    </search_results_page>
  </search_view>

  <settings_view>
    <settings_sidebar>
      - 메뉴: 일반, 보안 및 로그인, 개인정보, 알림, 차단, 언어, 접근성
    </settings_sidebar>

    <general_settings>
      - 이름 변경, 이메일 변경, 전화번호, 프로필 URL
    </general_settings>

    <security_settings>
      - 비밀번호 변경, 2단계 인증, 로그인 기록, 기기 관리
    </security_settings>

    <privacy_settings>
      - 게시물 기본 공개범위, 프로필 검색 허용, 친구 목록 공개
      - 차단 사용자 관리
    </privacy_settings>

    <notification_settings>
      - 카테고리별 이메일/푸시/인앱 알림 토글
    </notification_settings>
  </settings_view>

  <keyboard_shortcuts_reference>
    - j/k: 피드에서 다음/이전 게시물 포커스
    - l: 포커스된 게시물 좋아요
    - c: 포커스된 게시물 댓글 입력 포커스
    - s: 포커스된 게시물 공유 메뉴
    - /: 검색 포커스
    - Esc: 모달/패널 닫기
    - n: 새 게시물 작성
    - m: 메신저 열기
    - Alt+1~5: 네비게이션 탭 이동
    - Enter: 메시지 전송 (메신저)
    - Shift+Enter: 줄바꿈 (메신저)
  </keyboard_shortcuts_reference>
</pages_and_interfaces>

<core_functionality>
  <authentication>
    - 이메일/비밀번호 회원가입 (이메일 인증 필수)
    - OAuth 로그인: Google, Kakao, Apple
    - 매직링크 로그인 (이메일)
    - 비밀번호 재설정 (이메일 토큰, 1시간 유효)
    - 2단계 인증 (TOTP 앱 기반)
    - 세션 관리: JWT + Refresh Token (httpOnly 쿠키, 7일/30일)
    - 기기별 세션 추적 및 원격 로그아웃
    - Rate limiting: 로그인 실패 5회 시 15분 잠금
    - CRITICAL: bcrypt salt rounds 12, CSRF 토큰 필수, Secure + SameSite=Strict 쿠키
  </authentication>

  <user_management>
    - 프로필 CRUD (이름, 바이오, 아바타, 커버 이미지, 위치, 웹사이트)
    - 아바타/커버 이미지 업로드 (크롭, 리사이징: 아바타 400x400, 커버 1200x450)
    - 계정 비활성화 / 영구 삭제 (30일 유예 기간)
    - 프로필 검색 (Meilisearch 기반 전문 검색)
    - 사용자 차단/차단 해제
    - 사용자 신고
  </user_management>

  <friendship_system>
    - 친구 요청 보내기/취소
    - 친구 요청 수락/거절
    - 친구 삭제 (unfriend)
    - 공통 친구 계산 및 표시
    - 친구 추천 (공통 친구 수 기반, 위치 기반)
    - 친구 목록 공개범위 설정 (전체/친구/나만)
    - CRITICAL: 자신에게 친구 요청 불가, 중복 요청 방지, 차단된 사용자 상호 작용 차단
  </friendship_system>

  <post_management>
    - 게시물 CRUD (텍스트, 이미지, 동영상, 링크)
    - 리치 텍스트 에디터 (Tiptap): 볼드, 이탤릭, 링크, 멘션(@), 해시태그(#)
    - 다중 미디어 업로드 (최대 10개 이미지 또는 1개 동영상)
    - 이미지 자동 리사이징 (원본 + 썸네일 800px + 미리보기 200px)
    - 동영상: 최대 10분, 100MB, 서버 사이드 트랜스코딩 (ffmpeg via BullMQ)
    - 링크 프리뷰 자동 생성 (Open Graph 메타 태그 파싱)
    - 공개범위 설정: 전체공개, 친구만, 나만, 사용자 지정
    - 게시물 수정 (수정됨 표시, 수정 이력 보기)
    - 게시물 삭제 (soft delete)
    - 게시물 고정 (프로필 상단)
    - 사용자 태그 (@멘션)
    - 기분/활동 태그
    - 위치 태그
    - 공유 (원본 게시물 인용 형태)
    - 게시물 저장 (북마크)
    - 게시물 숨기기 / 신고
  </post_management>

  <newsfeed_algorithm>
    - 기본 정렬: 최신순 (chronological)
    - 스마트 정렬 옵션: 친밀도 가중치 (상호작용 빈도), 게시물 인기도, 콘텐츠 다양성
    - 피드 소스: 친구 게시물 + 가입 그룹 게시물 + 팔로우 페이지 게시물
    - 중복 제거 (동일 공유 게시물)
    - 커서 기반 페이지네이션 (무한 스크롤)
    - 피드 캐시: Redis에 사용자별 최근 100개 게시물 ID 캐시 (TTL 5분)
    - CRITICAL: N+1 쿼리 방지, 배치 로드 (DataLoader 패턴), 쿼리 최적화
  </newsfeed_algorithm>

  <reaction_system>
    - 6가지 리액션: 좋아요(👍), 사랑해요(❤️), 하하(😆), 와우(😮), 슬퍼요(😢), 화나요(😠)
    - 게시물 및 댓글에 리액션
    - 사용자당 대상당 1개 리액션 (변경 가능)
    - 리액션 수 denormalized (비동기 업데이트)
    - 리액션한 사용자 목록 보기 (유형별 탭)
  </reaction_system>

  <comment_system>
    - 댓글 CRUD
    - 대댓글 (최대 3단계 깊이)
    - 댓글에 이미지/GIF 첨부
    - 댓글 좋아요 (리액션)
    - 멘션 (@)
    - 댓글 정렬: 최신순 / 관련성순
    - 댓글 수 denormalized
    - 댓글 페이지네이션 (초기 2개 → "더 보기")
  </comment_system>

  <messaging>
    - 1:1 다이렉트 메시지
    - 그룹 채팅 (최대 250명)
    - 실시간 전송/수신 (Socket.IO WebSocket)
    - 메시지 유형: 텍스트, 이미지, 동영상, 파일, 이모지, 오디오
    - 이미지/파일 첨부 업로드
    - 메시지 답장 (reply)
    - 메시지 수정/삭제 (5분 이내)
    - 읽음 표시 (read receipts)
    - 타이핑 인디케이터
    - 온라인/오프라인 상태 (프레즌스)
    - 대화 음소거
    - 대화 검색
    - 메시지 검색
    - 미읽음 메시지 수 뱃지
    - CRITICAL: 메시지 전송 실패 시 재시도 큐, 오프라인 메시지 큐잉, 낙관적 업데이트
  </messaging>

  <notification_system>
    - 인앱 알림 (실시간 WebSocket)
    - 이메일 알림 (BullMQ 배치 처리, digest 모드 지원)
    - 알림 유형별 설정 (on/off)
    - 미읽음 카운트 뱃지 (상단 바 벨 아이콘)
    - 알림 읽음 처리 (개별/전체)
    - 알림 그룹핑 ("홍길동님 외 3명이 게시물에 좋아요를 눌렀습니다")
    - 알림 클릭 시 관련 콘텐츠로 이동
  </notification_system>

  <story_system>
    - 이미지/동영상 스토리 (24시간 후 자동 만료)
    - 텍스트 스토리 (배경 색상 선택)
    - 조회수 추적
    - 스토리 조회자 목록 (본인만 확인 가능)
    - 친구의 스토리 순서: 미확인 우선, 친밀도 기반
    - 만료된 스토리 자동 삭제 (Cron Job)
  </story_system>

  <group_management>
    - 그룹 CRUD (이름, 설명, 커버 이미지, 규칙)
    - 공개범위: 공개, 비공개, 비밀
    - 멤버 관리: 초대, 승인, 강퇴, 역할 변경 (멤버/관리자/매니저)
    - 그룹 내 게시물 CRUD
    - 관리자 승인 게시물 (비공개 그룹)
    - 그룹 검색 및 발견
    - 그룹 가입 요청/승인
  </group_management>

  <event_management>
    - 이벤트 CRUD (이름, 날짜, 위치, 설명, 커버 이미지)
    - 온라인/오프라인 이벤트
    - 참여 상태: 참여, 관심 있음, 참여 안 함
    - 이벤트 내 토론 (게시물)
    - 이벤트 초대 (친구에게)
    - 이벤트 알림 (시작 1일 전, 1시간 전)
    - 그룹 이벤트 연동
  </event_management>

  <search_functionality>
    - 전역 검색 (사용자, 게시물, 그룹, 이벤트)
    - Meilisearch 기반 전문 검색 (typo-tolerant, 한국어 지원)
    - 실시간 자동완성 (300ms 디바운싱)
    - 최근 검색 기록 (로컬 + 서버)
    - 필터: 날짜, 유형, 사람, 그룹
    - 검색 결과 페이지 (카테고리별 탭)
    - 해시태그 검색
  </search_functionality>

  <content_moderation>
    - 사용자 신고 (게시물, 댓글, 메시지, 사용자, 그룹)
    - 신고 카테고리: 스팸, 괴롭힘, 혐오 발언, 폭력, 선정성, 허위 정보, 기타
    - 관리자 신고 대시보드 (검토, 처리, 기각)
    - 자동 감지: 욕설 필터 (기본), 스팸 탐지 (반복 게시물)
    - 콘텐츠 삭제/비활성화 처리
    - 사용자 경고/일시정지/영구정지
  </content_moderation>

  <media_handling>
    - 이미지 업로드: JPEG, PNG, WebP, GIF (최대 10MB per file)
    - 동영상 업로드: MP4, MOV, AVI (최대 100MB, 10분)
    - 서버 사이드 이미지 최적화: Sharp (리사이징, WebP 변환, EXIF 스트리핑)
    - 동영상 트랜스코딩: BullMQ Worker (ffmpeg, 720p/1080p, HLS)
    - 썸네일 자동 생성
    - CDN 배포 (Cloudflare)
    - 업로드 진행률 표시
    - 드래그 앤 드롭 업로드
    - 클립보드 붙여넣기 업로드
  </media_handling>
</core_functionality>

<aesthetic_guidelines>
  <design_fusion>
    클린하고 모던한 소셜 미디어 디자인. 페이스북의 직관적 레이아웃에서 영감을 받되, 더 깨끗하고 세련된 느낌. 콘텐츠에 집중할 수 있는 넉넉한 여백, 부드러운 그림자, 미세한 호버 효과. 접근성을 최우선으로 고려하며 WCAG 2.1 AA 기준 준수.
  </design_fusion>

  <color_palette>
    <primary_colors>
      - Primary Blue: #1877F2 - 브랜드 컬러, CTA 버튼, 활성 상태, 링크
      - Primary Blue Hover: #166FE5 - 버튼 호버
      - Primary Blue Light: #EBF5FF - 활성 배경, 선택 상태
      - Primary Blue Dark: #1360C7 - 포커스 링, 액티브 상태
    </primary_colors>

    <background_colors>
      - Page Background: #F0F2F5 - 전체 페이지 배경
      - Card Background: #FFFFFF - 카드, 모달, 패널 배경
      - Input Background: #F0F2F5 - 입력칸, 검색바 배경
      - Hover Background: #F0F2F5 - 호버 상태 배경
      - Active Background: #E4E6EB - 활성/클릭 상태 배경
      - Overlay: rgba(0, 0, 0, 0.65) - 모달 오버레이
      - Tooltip Background: rgba(0, 0, 0, 0.8)
    </background_colors>

    <text_colors>
      - Primary Text: #050505 - 제목, 이름, 주요 텍스트
      - Secondary Text: #65676B - 시간, 부가 정보, 플레이스홀더
      - Tertiary Text: #8A8D91 - 비활성 텍스트
      - Link Text: #1877F2 - 링크, 인터랙티브 텍스트
      - Inverse Text: #FFFFFF - 다크 배경 위 텍스트
      - Error Text: #DC3545
    </text_colors>

    <status_colors>
      - Online Green: #31A24C - 온라인 상태 표시
      - Success Green: #31A24C - 성공 상태
      - Warning Yellow: #F0AD4E - 경고 상태
      - Error Red: #DC3545 - 에러, 삭제
      - Info Blue: #1877F2 - 정보
    </status_colors>

    <reaction_colors>
      - Like Blue: #1877F2
      - Love Red: #F33E58
      - Haha Yellow: #F7B928
      - Wow Yellow: #F7B928
      - Sad Yellow: #F7B928
      - Angry Orange: #E9710F
    </reaction_colors>

    <dark_theme>
      - Page Background: #18191A
      - Card Background: #242526
      - Input Background: #3A3B3C
      - Hover Background: #3A3B3C
      - Active Background: #4E4F50
      - Primary Text: #E4E6EB
      - Secondary Text: #B0B3B8
      - Divider: #3E4042
      - Primary Blue: #2D88FF (다크 모드 최적화)
      - Message Bubble (mine): #0084FF
      - Message Bubble (other): #3A3B3C
    </dark_theme>
  </color_palette>

  <typography>
    <font_families>
      - Primary: 'Segoe UI', Helvetica, Arial, sans-serif (시스템 폰트 스택)
      - Korean: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif
      - Monospace: 'SF Mono', 'Roboto Mono', monospace (코드 블록)
    </font_families>

    <font_sizes>
      - Hero Title: 32px, weight 800 (프로필 이름)
      - Page Title: 24px, weight 700 (섹션 제목)
      - Section Title: 20px, weight 700 (모달 제목)
      - Card Title: 17px, weight 600 (카드 제목)
      - Body Large: 17px, weight 400 (게시물 짧은 텍스트)
      - Body: 15px, weight 400, line-height 1.34 (기본 본문)
      - Body Small: 13px, weight 400 (시간, 부가 정보)
      - Caption: 12px, weight 400 (뱃지, 레이블)
      - Micro: 11px, weight 600 (알림 뱃지 숫자)
    </font_sizes>

    <line_heights>
      - Tight: 1.15 (제목)
      - Normal: 1.34 (본문)
      - Relaxed: 1.5 (긴 텍스트)
    </line_heights>
  </typography>

  <spacing>
    - Base Unit: 4px
    - Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
    - Card Padding: 16px
    - Card Gap: 16px (카드 간 간격)
    - Section Gap: 24px
    - Page Padding: 24px (메인 콘텐츠 좌우)
    - List Item Gap: 4px (목록 아이템 간)
    - Inline Gap: 8px (인라인 요소 간)
  </spacing>

  <borders_and_shadows>
    <borders>
      - Default: 1px solid #E4E6EB (라이트) / 1px solid #3E4042 (다크)
      - Focus Ring: 2px solid #1877F2 (아웃라인, offset 2px)
      - Divider: 1px solid #CED0D4
      - Border Radius SM: 6px (버튼, 입력)
      - Border Radius MD: 8px (카드)
      - Border Radius LG: 12px (모달)
      - Border Radius Full: 9999px (아바타, 칩, 검색바)
    </borders>

    <shadows>
      - Card: 0 1px 2px rgba(0, 0, 0, 0.1)
      - Dropdown: 0 2px 12px rgba(0, 0, 0, 0.15)
      - Modal: 0 12px 28px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)
      - Tooltip: 0 2px 6px rgba(0, 0, 0, 0.2)
      - Navigation: 0 2px 4px rgba(0, 0, 0, 0.1) (스크롤 시)
      - Float Chat: 0 4px 16px rgba(0, 0, 0, 0.2)
    </shadows>
  </borders_and_shadows>

  <component_styling>
    <buttons>
      - Primary: 배경 #1877F2, 색상 #FFFFFF, border-radius 6px, 높이 36px, 패딩 0 16px, font 15px weight 600
      - Primary Hover: 배경 #166FE5
      - Secondary: 배경 #E4E6EB, 색상 #050505, 동일 규격
      - Secondary Hover: 배경 #D8DADF
      - Ghost: 배경 transparent, 색상 #1877F2
      - Ghost Hover: 배경 #EBF5FF
      - Danger: 배경 #DC3545, 색상 #FFFFFF
      - Disabled: opacity 0.5, cursor not-allowed
      - Icon Button: 36px 원형, 배경 #E4E6EB, 호버 배경 #D8DADF
      - Large Button: 높이 44px, font 17px
    </buttons>

    <inputs>
      - Default: 높이 40px, 배경 #F0F2F5, border-radius 20px (검색) / 6px (폼), 패딩 0 12px, font 15px
      - Focus: border 2px solid #1877F2, 배경 #FFFFFF
      - Error: border 2px solid #DC3545
      - Textarea: 최소 높이 100px, 자동 확장, border-radius 8px
      - Label: 12px, weight 600, color #65676B, margin-bottom 4px
    </inputs>

    <cards>
      - 배경: #FFFFFF, border-radius 8px, box-shadow: 0 1px 2px rgba(0,0,0,0.1)
      - 패딩: 16px
      - 카드 내 구분선: 1px solid #E4E6EB, margin 12px -16px
    </cards>

    <avatars>
      - XS: 28px (댓글 내 멘션)
      - SM: 32px (댓글, 채팅 메시지)
      - MD: 40px (게시물 헤더, 목록 아이템)
      - LG: 48px (대화 목록)
      - XL: 80px (친구 카드)
      - XXL: 168px (프로필 페이지)
      - 모든 크기: 원형 (border-radius 50%), object-fit cover
      - 기본 아바타: 이니셜 기반 (배경 #1877F2, 색상 white)
      - 온라인 표시: 우하단 초록 점 (크기의 25%, border 2px white)
    </avatars>

    <badges>
      - 알림 뱃지: min-width 18px, 높이 18px, border-radius 9px, 배경 #DC3545, 색상 white, font 11px weight 700
      - 위치: 부모 우상단 (-4px, -4px)
      - 숫자 99+: "99+" 표시
    </badges>

    <modals>
      - 오버레이: rgba(255, 255, 255, 0.8) + backdrop-filter blur(4px)
      - 모달: 배경 #FFFFFF, border-radius 12px, box-shadow modal
      - 헤더: 높이 60px, 하단 border, 제목 중앙 정렬
      - 닫기 버튼: 우상단, 36px 원형, 배경 #E4E6EB
      - 애니메이션: scale(0.95) → scale(1), opacity 0→1, 200ms ease-out
    </modals>

    <dropdowns>
      - 배경: #FFFFFF, border-radius 8px, box-shadow dropdown
      - 항목: 높이 44px, 패딩 8px 12px
      - 항목 호버: 배경 #F0F2F5
      - 구분선: 1px solid #E4E6EB, margin 4px 0
      - 최대 높이: 400px, 오버플로우 스크롤
    </dropdowns>

    <tooltips>
      - 배경: rgba(0, 0, 0, 0.8), 색상 #FFFFFF, border-radius 6px, 패딩 6px 10px
      - Font: 12px, max-width 200px
      - 딜레이: 300ms (표시), 0ms (숨기기)
      - 위치: 대상 위/아래 자동
    </tooltips>

    <skeleton_loading>
      - 배경: #E4E6EB, 애니메이션: pulse (배경 #E4E6EB ↔ #F0F2F5, 1.5s ease-in-out infinite)
      - border-radius: 원본 요소와 동일
      - 아바타 스켈레톤: 원형
      - 텍스트 스켈레톤: 높이 12px, border-radius 6px, 너비 60-100% 랜덤
    </skeleton_loading>
  </component_styling>

  <animations>
    <micro_interactions>
      - 좋아요 버튼 클릭: scale(1) → scale(1.2) → scale(1), 300ms, ease-out
      - 리액션 피커 진입: scale(0.5) + opacity(0) → scale(1) + opacity(1), 200ms, ease-out
      - 뱃지 업데이트: scale(1.3) → scale(1), 200ms, spring
      - 버튼 호버: 배경색 전환 100ms ease
      - 토글 스위치: 전환 200ms ease-in-out
    </micro_interactions>

    <page_transitions>
      - 페이지 전환: fadeIn, 200ms, ease-out
      - 탭 전환: 콘텐츠 fadeIn, 150ms
      - 모달 열기: scale(0.95) → scale(1) + opacity 0→1, 200ms, ease-out
      - 모달 닫기: opacity 1→0, 150ms, ease-in
      - 드로어 열기: translateX(100%) → translateX(0), 250ms, ease-out
    </page_transitions>

    <loading_states>
      - 스켈레톤 펄스: 1.5s ease-in-out infinite
      - 스피너: 회전 360deg, 800ms linear infinite
      - 진행률 바: 배경 전환 300ms, stripe 애니메이션
      - 메시지 전송: 슬라이드 업 + 페이드 인, 200ms
    </loading_states>

    <scroll_animations>
      - 무한 스크롤 로드: 새 카드 fadeIn + slideUp(20px), 300ms, stagger 50ms
      - 스크롤 투 탑 버튼: fadeIn, 200ms (스크롤 위치 > 500px)
    </scroll_animations>
  </animations>

  <icons>
    - 라이브러리: Lucide React 0.363
    - 기본 크기: 20px (인라인), 24px (네비게이션), 28px (사이드바)
    - 스트로크: 2px
    - 컬러: currentColor (텍스트 색상 상속)
    - 네비게이션 아이콘: 아웃라인 (비활성) / 필드 (활성)
  </icons>

  <accessibility>
    - WCAG 2.1 AA 준수
    - 포커스 링: 모든 인터랙티브 요소에 2px solid #1877F2 아웃라인 (키보드 네비게이션 시)
    - 마우스 사용 시 포커스 링 숨김 (:focus-visible)
    - 최소 터치 타겟: 44x44px
    - 색상 대비: 텍스트 최소 4.5:1, 대형 텍스트 3:1
    - 이미지 alt 텍스트 필수
    - aria-label, aria-describedby 적극 활용
    - 스크린 리더 전용 텍스트 (.sr-only)
    - 모션 감소: prefers-reduced-motion 미디어 쿼리 지원
    - 키보드 네비게이션: Tab, Shift+Tab, Enter, Space, Escape, 방향키
    - 라이브 리전: aria-live="polite" (알림, 토스트)
  </accessibility>
</aesthetic_guidelines>

<advanced_functionality>
  <realtime_features>
    - WebSocket 연결 관리 (Socket.IO): 자동 재연결, 지수 백오프
    - 실시간 메시지 수신/발신
    - 실시간 알림
    - 타이핑 인디케이터 (3초 디바운싱)
    - 온라인/오프라인 프레즌스 (Redis pub/sub)
    - 실시간 좋아요/댓글 카운트 업데이트 (낙관적 UI)
    - 룸 기반 이벤트: conversation:{id}, user:{id}, post:{id}
  </realtime_features>

  <performance_optimization>
    - 이미지 레이지 로딩 (Intersection Observer)
    - 가상 스크롤링 (@tanstack/react-virtual) - 긴 대화 목록, 댓글
    - Next.js Image 컴포넌트 (자동 WebP, 반응형, 레이지 로드)
    - API 응답 캐싱 (TanStack Query staleTime: 30s, cacheTime: 5min)
    - Redis 캐싱: 피드 (5분), 사용자 프로필 (10분), 인기 게시물 (1시간)
    - 정적 자산 CDN (Cloudflare)
    - 코드 스플리팅: 라우트별 동적 임포트
    - 서버 컴포넌트 (React Server Components): 데이터 페칭 최적화
    - 프리페칭: 링크 호버 시 라우트 프리페치
    - 번들 사이즈: 초기 JS < 200KB (gzipped)
    - LCP < 2.5s, FID < 100ms, CLS < 0.1
  </performance_optimization>

  <security>
    - CSRF 토큰 (모든 mutation 요청)
    - XSS 방지: DOMPurify 새니타이징 (모든 사용자 입력 HTML)
    - SQL Injection 방지: Prisma 파라미터화 쿼리
    - Rate Limiting: API 엔드포인트별 (rate-limiter-flexible + Redis)
      - 일반 API: 100 req/min
      - 인증: 10 req/min
      - 업로드: 20 req/min
      - 검색: 30 req/min
    - Content Security Policy (CSP) 헤더
    - HSTS, X-Frame-Options, X-Content-Type-Options 헤더
    - 파일 업로드 검증: MIME 타입, 파일 크기, 매직 바이트 확인
    - 비밀번호 정책: 최소 8자, 대소문자+숫자+특수문자
    - 세션 관리: 서버 사이드 세션 무효화, 동시 세션 제한 (최대 5기기)
    - 이메일 인증 토큰: 1시간 유효, 1회 사용
    - CRITICAL: 절대 클라이언트에 비밀키/API 키 노출 금지. 모든 민감한 로직은 서버 사이드에서만 실행.
  </security>

  <scalability>
    - 데이터베이스: 읽기 복제본 (Read Replica) 분리
    - 커넥션 풀링: PgBouncer (최대 100 커넥션)
    - 수평 확장: 상태 비저장(Stateless) API 서버
    - Socket.IO: Redis Adapter (다중 인스턴스 동기화)
    - 미디어 처리: 별도 Worker 프로세스 (BullMQ)
    - 피드 생성: Fan-out on write (소규모) → Fan-out on read (대규모) 하이브리드
    - 데이터베이스 샤딩 전략: 사용자 ID 기반 (향후)
    - CDN: 정적 자산 + 미디어 엣지 캐싱
  </scalability>

  <internationalization>
    - next-intl 기반 다국어 지원
    - 기본 언어: 한국어 (ko)
    - 추가 언어: 영어 (en), 일본어 (ja)
    - 날짜/시간 로캘라이제이션
    - RTL 레이아웃 지원 (향후)
    - 번역 키: JSON 파일 기반 (messages/ko.json, messages/en.json)
  </internationalization>

  <dark_mode>
    - 시스템 설정 자동 감지 (prefers-color-scheme)
    - 수동 토글 (라이트/다크/시스템)
    - 설정 localStorage 저장
    - Tailwind CSS dark: variant 활용
    - 전환 애니메이션: 200ms ease (모든 배경/텍스트 색상)
    - CRITICAL: 모든 UI 컴포넌트에 다크 모드 스타일 필수
  </dark_mode>

  <admin_dashboard>
    - 접근: role=admin 사용자만
    - 사용자 관리: 목록, 검색, 상세, 정지/복구
    - 콘텐츠 관리: 신고된 게시물/댓글 검토
    - 통계 대시보드: DAU, MAU, 게시물/메시지 수, 신규 가입 (Recharts)
    - 시스템 상태: API 응답 시간, 에러율, 서버 상태
  </admin_dashboard>
</advanced_functionality>

<final_integration_test>
  <test_scenario_1>
    <description>신규 사용자 회원가입 및 프로필 설정 플로우</description>
    <steps>
      1. /signup 페이지로 이동한다
      2. 이메일, 비밀번호(대소문자+숫자+특수문자 8자 이상), 이름, 생년월일을 입력한다
      3. "가입하기" 버튼을 클릭한다
      4. 이메일 인증 안내 페이지가 표시되는지 확인한다
      5. 이메일에서 인증 링크를 클릭한다
      6. 로그인 후 프로필 페이지로 리다이렉트되는지 확인한다
      7. "프로필 수정"을 클릭하고 아바타 이미지를 업로드한다
      8. 이미지 크롭 모달이 표시되고 크롭 후 저장한다
      9. 아바타가 상단 바와 프로필 모두에 반영되는지 확인한다
      10. 바이오, 위치, 웹사이트를 입력하고 저장한다
      11. 프로필 페이지에서 모든 정보가 올바르게 표시되는지 확인한다
    </steps>
  </test_scenario_1>

  <test_scenario_2>
    <description>친구 추가 및 뉴스피드 게시물 상호작용</description>
    <steps>
      1. 검색바에 친구 이름을 입력한다
      2. 검색 결과에서 해당 사용자를 찾아 "친구 추가" 버튼을 클릭한다
      3. 상대방에게 친구 요청 알림이 실시간으로 전달되는지 확인한다
      4. 상대방이 수락하면 양측 모두에게 "친구가 됨" 알림이 표시되는지 확인한다
      5. 뉴스피드에서 "무슨 생각을 하고 계신가요?" 클릭하여 게시물 작성 모달을 연다
      6. 텍스트를 입력하고 이미지 2장을 첨부한 뒤 "게시" 버튼을 클릭한다
      7. 뉴스피드에 게시물이 즉시 나타나고 이미지가 2열 그리드로 표시되는지 확인한다
      8. 친구의 피드에도 해당 게시물이 표시되는지 확인한다
      9. 좋아요 버튼을 길게 눌러 리액션 피커를 열고 "사랑해요"를 선택한다
      10. 리액션이 카운트에 반영되는지 확인한다
      11. 댓글을 작성하고 댓글 수가 업데이트되는지 확인한다
      12. 게시물 작성자에게 좋아요/댓글 알림이 전달되는지 확인한다
    </steps>
  </test_scenario_2>

  <test_scenario_3>
    <description>실시간 메시징 플로우</description>
    <steps>
      1. 상단 바의 메시지 아이콘을 클릭한다
      2. "새 메시지" 버튼을 클릭하고 친구를 검색하여 선택한다
      3. 새 대화가 생성되고 채팅 창이 열리는지 확인한다
      4. 텍스트 메시지를 입력하고 Enter로 전송한다
      5. 메시지가 즉시 채팅 창에 나타나고 상대방에게 실시간 전달되는지 확인한다
      6. 상대방이 타이핑 중일 때 타이핑 인디케이터가 표시되는지 확인한다
      7. 이미지를 첨부하여 전송하고 미리보기가 올바르게 표시되는지 확인한다
      8. 상대방이 메시지를 읽으면 읽음 표시가 나타나는지 확인한다
      9. 대화 목록에서 마지막 메시지와 미읽음 뱃지가 올바르게 표시되는지 확인한다
      10. 채팅 창을 닫고 플로팅 채팅 헤드로 전환되는지 확인한다
    </steps>
  </test_scenario_3>

  <test_scenario_4>
    <description>스토리 생성 및 보기</description>
    <steps>
      1. 스토리 바에서 "스토리 만들기" 카드를 클릭한다
      2. 이미지를 업로드하고 캡션을 입력한다
      3. "스토리 게시" 버튼을 클릭한다
      4. 스토리 바에서 내 스토리가 첫 번째에 표시되는지 확인한다
      5. 친구의 스토리를 클릭하여 전체 화면으로 보기가 열리는지 확인한다
      6. 다음/이전 스토리 네비게이션이 동작하는지 확인한다
      7. 24시간 후 스토리가 자동으로 사라지는지 확인한다
      8. 스토리 작성자가 조회자 목록을 확인할 수 있는지 검증한다
    </steps>
  </test_scenario_4>

  <test_scenario_5>
    <description>그룹 생성 및 운영</description>
    <steps>
      1. 좌측 사이드바에서 "그룹"을 클릭하고 "그룹 만들기"를 선택한다
      2. 그룹 이름, 설명, 공개범위(비공개)를 설정하고 생성한다
      3. 그룹 페이지로 이동되고 관리자로 표시되는지 확인한다
      4. 친구를 그룹에 초대한다
      5. 초대받은 친구에게 알림이 전달되는지 확인한다
      6. 친구가 가입하면 멤버 수가 업데이트되는지 확인한다
      7. 그룹 내에서 게시물을 작성한다
      8. 그룹 피드에 게시물이 표시되는지 확인한다
      9. 멤버 관리에서 역할 변경(관리자 지정)이 동작하는지 확인한다
      10. 비공개 그룹이 검색에서 이름만 노출되고 콘텐츠는 숨겨지는지 확인한다
    </steps>
  </test_scenario_5>

  <test_scenario_6>
    <description>검색 기능 종합 테스트</description>
    <steps>
      1. 상단 검색바에 사용자 이름의 일부를 입력한다
      2. 300ms 디바운싱 후 자동완성 결과가 표시되는지 확인한다
      3. 오타가 있어도 유사 결과가 나타나는지 확인한다 (typo-tolerant)
      4. Enter를 눌러 검색 결과 페이지로 이동한다
      5. 좌측 필터 (사람, 게시물, 그룹)를 전환하며 결과가 변경되는지 확인한다
      6. "게시물" 필터에서 검색어가 하이라이트 처리되는지 확인한다
      7. 검색 결과가 없을 때 적절한 빈 상태 메시지가 표시되는지 확인한다
      8. 최근 검색 기록이 저장되고 삭제할 수 있는지 확인한다
    </steps>
  </test_scenario_6>

  <test_scenario_7>
    <description>다크 모드 전환 및 반응형 레이아웃</description>
    <steps>
      1. 설정에서 다크 모드로 전환한다
      2. 모든 페이지(뉴스피드, 프로필, 메신저, 그룹)에서 다크 테마가 올바르게 적용되는지 확인한다
      3. 텍스트 가독성(대비 비율 4.5:1 이상)이 유지되는지 확인한다
      4. 시스템 모드로 전환하고 OS 설정 변경 시 자동으로 테마가 바뀌는지 확인한다
      5. 브라우저 너비를 768px로 줄인다
      6. 사이드바가 숨겨지고 하단 네비게이션 바가 나타나는지 확인한다
      7. 480px로 더 줄여 모바일 레이아웃이 올바르게 적용되는지 확인한다
      8. 모든 터치 타겟이 최소 44x44px인지 확인한다
    </steps>
  </test_scenario_7>

  <test_scenario_8>
    <description>보안 및 권한 테스트</description>
    <steps>
      1. 로그인하지 않은 상태에서 /feed에 접근하면 /login으로 리다이렉트되는지 확인한다
      2. 비공개 프로필 사용자의 게시물이 친구가 아닌 사람에게 보이지 않는지 확인한다
      3. 차단한 사용자가 내 프로필, 게시물, 검색 결과에서 사라지는지 확인한다
      4. 차단한 사용자가 나에게 메시지를 보낼 수 없는지 확인한다
      5. XSS 페이로드를 게시물에 입력하고 새니타이징되는지 확인한다 (&lt;script&gt; 태그 제거)
      6. Rate limit 초과 시 429 응답과 적절한 에러 메시지가 표시되는지 확인한다
      7. 로그인 실패 5회 후 15분 잠금이 동작하는지 확인한다
      8. 관리자가 아닌 사용자가 /admin에 접근하면 403이 반환되는지 확인한다
      9. CSRF 토큰 없이 POST 요청 시 거부되는지 확인한다
      10. 다른 사용자의 게시물/댓글 수정/삭제가 불가능한지 확인한다
    </steps>
  </test_scenario_8>

  <test_scenario_9>
    <description>이벤트 생성 및 참여 플로우</description>
    <steps>
      1. 이벤트 페이지에서 "이벤트 만들기"를 클릭한다
      2. 이벤트 이름, 날짜/시간, 위치, 설명을 입력하고 커버 이미지를 업로드한다
      3. "이벤트 만들기" 버튼을 클릭하고 이벤트 상세 페이지로 이동되는지 확인한다
      4. 친구를 이벤트에 초대한다
      5. 초대받은 친구에게 알림이 전달되는지 확인한다
      6. 친구가 "참여"를 클릭하면 참여자 수가 업데이트되는지 확인한다
      7. 이벤트 토론에 게시물을 작성한다
      8. 이벤트 시작 1시간 전 알림이 발송되는지 확인한다
    </steps>
  </test_scenario_9>

  <test_scenario_10>
    <description>성능 및 무한 스크롤 테스트</description>
    <steps>
      1. 뉴스피드에 100개 이상의 게시물이 있는 상태에서 페이지를 로드한다
      2. 초기 로드 시 LCP가 2.5초 이내인지 측정한다
      3. 스크롤하여 무한 스크롤이 매끄럽게 동작하는지 확인한다
      4. 새로운 게시물 배치가 로드될 때 스켈레톤이 표시되는지 확인한다
      5. 메신저에서 1000개 이상의 메시지가 있는 대화를 열고 가상 스크롤이 동작하는지 확인한다
      6. 네트워크 탭에서 이미지 레이지 로딩이 적용되는지 확인한다
      7. 뒤로가기 시 TanStack Query 캐시로 즉시 복원되는지 확인한다
      8. 오프라인 상태에서 캐시된 피드가 표시되는지 확인한다
    </steps>
  </test_scenario_10>

  <test_scenario_11>
    <description>콘텐츠 신고 및 관리자 처리</description>
    <steps>
      1. 게시물의 ··· 메뉴에서 "신고"를 클릭한다
      2. 신고 사유 (스팸, 괴롭힘 등)를 선택하고 설명을 입력한다
      3. "신고" 버튼을 클릭하고 확인 메시지가 표시되는지 확인한다
      4. 관리자 계정으로 로그인한다
      5. 관리자 대시보드에서 신고 목록에 해당 신고가 나타나는지 확인한다
      6. 신고 상세를 열고 원본 콘텐츠를 확인할 수 있는지 검증한다
      7. "콘텐츠 삭제" 처리를 하고 해당 게시물이 비활성화되는지 확인한다
      8. 게시물 작성자에게 알림이 전달되는지 확인한다
    </steps>
  </test_scenario_11>
</final_integration_test>

<success_criteria>
  <functionality>
    - 회원가입부터 게시물 작성까지 전체 플로우 완료 가능
    - 친구 시스템 (요청/수락/삭제/차단) 모든 상태 전환 정상 동작
    - 게시물 CRUD + 리액션/댓글/공유 모든 기능 정상 동작
    - 실시간 메시징: 메시지 전송 지연 500ms 이내
    - 알림: 이벤트 발생 후 2초 이내 인앱 알림 도달
    - 스토리: 24시간 후 자동 만료 정확히 동작
    - 검색: 자동완성 응답 300ms 이내
    - 그룹/이벤트 CRUD 및 멤버 관리 정상 동작
    - 다크 모드: 모든 페이지/컴포넌트에 완전 적용
  </functionality>

  <user_experience>
    - LCP (Largest Contentful Paint): < 2.5초
    - FID (First Input Delay): < 100ms
    - CLS (Cumulative Layout Shift): < 0.1
    - TTI (Time to Interactive): < 3.5초
    - 무한 스크롤: 60fps 유지, 프레임 드롭 없음
    - 이미지 업로드: 10MB 파일 3초 이내 완료
    - 페이지 전환: 200ms 이내 시각적 피드백
    - 모바일 (768px 이하): 모든 기능 정상 동작, 터치 최적화
    - 접근성: WCAG 2.1 AA 준수, Lighthouse Accessibility 점수 90 이상
  </user_experience>

  <technical_quality>
    - TypeScript strict mode, 타입 에러 0개
    - ESLint/Prettier 경고 0개
    - 테스트 커버리지: 핵심 비즈니스 로직 80% 이상
    - E2E 테스트: 핵심 플로우 (회원가입, 게시물, 메시징) 커버
    - API 응답: 95th percentile < 200ms
    - 데이터베이스 쿼리: N+1 쿼리 없음
    - 번들 사이즈: 초기 JS < 200KB (gzipped)
    - 보안: OWASP Top 10 취약점 0개
  </technical_quality>

  <visual_design>
    - 디자인 시스템: 색상/타이포그래피/스페이싱 일관성 100%
    - 반응형: 320px ~ 2560px 모든 뷰포트에서 레이아웃 정상
    - 다크 모드: 라이트 모드와 동일한 정보 계층 구조 유지
    - 애니메이션: 모든 전환에 easing 적용, 끊김 없음
    - 스켈레톤 로딩: 모든 데이터 의존 UI에 적용
    - 빈 상태: 모든 리스트/피드에 빈 상태 UI 존재
    - 에러 상태: 모든 API 호출에 에러 UI 존재
  </visual_design>

  <build>
    - next build 성공 (에러/경고 0개)
    - Docker 빌드 성공
    - Vercel 배포 성공
    - 환경 변수만 변경하여 다른 환경에 배포 가능
    - 데이터베이스 마이그레이션: prisma migrate deploy 성공
  </build>
</success_criteria>

<build_output>
  <build_command>pnpm build (내부: next build)</build_command>
  <output_directory>.next/ (Next.js 빌드 출력)</output_directory>
  <deployment>
    - Vercel: git push 시 자동 배포 (프리뷰 + 프로덕션)
    - Socket.IO 서버: Docker 이미지 → AWS ECS 배포
    - BullMQ Worker: Docker 이미지 → AWS ECS 배포
    - 데이터베이스: AWS RDS (PostgreSQL) + ElastiCache (Redis)
    - 검색: Meilisearch Cloud 또는 자체 호스팅
  </deployment>
  <docker>
    - Dockerfile: 멀티 스테이지 빌드 (빌드 → 프로덕션)
    - docker-compose.yml: Next.js + PostgreSQL + Redis + Meilisearch + Socket.IO
    - docker-compose.prod.yml: 프로덕션 설정
  </docker>
</build_output>

<key_implementation_notes>
  <critical_paths>
    1. 인증 시스템: NextAuth.js 설정, 세션 관리, 미들웨어 (가장 먼저 완성해야 모든 기능 개발 가능)
    2. 데이터베이스 스키마: Prisma 스키마 완성 및 마이그레이션 (모든 엔티티의 기반)
    3. 실시간 인프라: Socket.IO 서버 + Redis pub/sub (메시징, 알림의 기반)
    4. 파일 업로드: S3 + CDN 파이프라인 (게시물, 프로필, 메시징에 필수)
    5. 뉴스피드 알고리즘: 쿼리 최적화 + 캐싱 (가장 빈번한 페이지, 성능 핵심)
  </critical_paths>

  <recommended_implementation_order>
    Phase 1 - 기반 (1-2주):
    1. 프로젝트 초기화: Next.js + TypeScript + Tailwind + shadcn/ui + Prisma
    2. Docker Compose 환경 (PostgreSQL + Redis + Meilisearch)
    3. Prisma 스키마: User, Friendship, Post, Comment, Reaction
    4. NextAuth.js: 이메일/비밀번호 + OAuth (Google, Kakao)
    5. tRPC 라우터 기본 구조
    6. 미들웨어: 인증, Rate Limiting, CSRF

    Phase 2 - 핵심 소셜 (2-3주):
    7. 사용자 프로필: CRUD, 아바타/커버 업로드 (S3)
    8. 친구 시스템: 요청/수락/삭제/차단
    9. 게시물: CRUD, 리치 텍스트 에디터, 미디어 업로드
    10. 뉴스피드: 피드 알고리즘, 무한 스크롤, 캐싱
    11. 리액션 + 댓글 시스템
    12. 게시물 공유, 저장(북마크)

    Phase 3 - 실시간 (1-2주):
    13. Socket.IO 서버 + Redis Adapter
    14. 실시간 메시징: 1:1 + 그룹 채팅
    15. 알림 시스템: 인앱 + 이메일 (BullMQ)
    16. 프레즌스 (온라인/오프라인)
    17. 타이핑 인디케이터, 읽음 표시

    Phase 4 - 확장 기능 (1-2주):
    18. 스토리 시스템
    19. 그룹 기능
    20. 이벤트 기능
    21. 검색 (Meilisearch 연동)
    22. 관리자 대시보드

    Phase 5 - 마무리 (1-2주):
    23. 다크 모드
    24. 반응형 레이아웃 (모바일)
    25. 국제화 (i18n)
    26. 성능 최적화 (코드 스플리팅, 이미지 최적화, 캐싱)
    27. 보안 감사 (OWASP Top 10 체크)
    28. E2E 테스트 (Playwright)
    29. 배포 파이프라인 (GitHub Actions → Vercel + AWS)
  </recommended_implementation_order>

  <database_schema>
    CRITICAL: Prisma 스키마에서 다음 인덱스 최적화 필수:
    - 뉴스피드 쿼리: Post에 (authorId, createdAt DESC) 복합 인덱스
    - 친구 조회: Friendship에 (requesterId, status) + (addresseeId, status) 복합 인덱스
    - 메시지 조회: Message에 (conversationId, createdAt DESC) 복합 인덱스
    - 알림 조회: Notification에 (recipientId, isRead, createdAt DESC) 복합 인덱스
    - Soft delete: 모든 주요 엔티티에 deletedAt 필드, 쿼리 시 WHERE deletedAt IS NULL 필수
  </database_schema>

  <performance_considerations>
    - 뉴스피드: Fan-out on write 패턴으로 사용자별 피드 Redis에 미리 구성 (소규모 시)
    - 대규모: Fan-out on read로 전환, 쿼리 시점에 집계
    - 카운터 업데이트: denormalized 카운트는 비동기 BullMQ Job으로 업데이트 (eventual consistency)
    - N+1 방지: Prisma include/select 최적화, DataLoader 패턴
    - 이미지: Next.js Image 컴포넌트 (srcSet, sizes, lazy, blur placeholder)
    - 번들: dynamic import로 메신저, 설정 등 비핵심 페이지 코드 분리
    - WebSocket: 하트비트 30초, 재연결 지수 백오프 (1s, 2s, 4s, 8s, max 30s)
  </performance_considerations>

  <testing_strategy>
    - 단위 테스트: Vitest (비즈니스 로직, 유틸리티 함수)
    - 통합 테스트: Vitest + Prisma (데이터베이스 쿼리, tRPC 라우터)
    - E2E 테스트: Playwright (핵심 사용자 플로우)
    - 컴포넌트 테스트: React Testing Library (UI 컴포넌트)
    - API 테스트: supertest 또는 tRPC 테스트 유틸리티
    - 부하 테스트: k6 (WebSocket, API 엔드포인트)
    - CI: GitHub Actions에서 PR마다 린트 + 테스트 + 빌드 자동 실행
  </testing_strategy>

  <folder_structure>
    ```
    connectia/
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.ts
    ├── src/
    │   ├── app/                    # Next.js App Router
    │   │   ├── (auth)/             # 인증 레이아웃 그룹
    │   │   │   ├── login/
    │   │   │   ├── signup/
    │   │   │   └── layout.tsx
    │   │   ├── (main)/             # 메인 레이아웃 그룹
    │   │   │   ├── feed/
    │   │   │   ├── profile/[username]/
    │   │   │   ├── friends/
    │   │   │   ├── messages/
    │   │   │   ├── groups/
    │   │   │   ├── events/
    │   │   │   ├── search/
    │   │   │   ├── settings/
    │   │   │   └── layout.tsx
    │   │   ├── admin/              # 관리자 대시보드
    │   │   ├── api/
    │   │   │   ├── trpc/[trpc]/route.ts
    │   │   │   ├── auth/[...nextauth]/route.ts
    │   │   │   ├── upload/route.ts
    │   │   │   └── webhook/route.ts
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── ui/                 # shadcn/ui 컴포넌트
    │   │   ├── layout/             # 레이아웃 컴포넌트 (TopNav, Sidebar 등)
    │   │   ├── post/               # 게시물 관련 컴포넌트
    │   │   ├── profile/            # 프로필 관련 컴포넌트
    │   │   ├── messenger/          # 메신저 관련 컴포넌트
    │   │   ├── notification/       # 알림 관련 컴포넌트
    │   │   └── shared/             # 공통 컴포넌트 (Avatar, Badge 등)
    │   ├── server/
    │   │   ├── api/
    │   │   │   ├── routers/        # tRPC 라우터
    │   │   │   │   ├── user.ts
    │   │   │   │   ├── post.ts
    │   │   │   │   ├── comment.ts
    │   │   │   │   ├── friendship.ts
    │   │   │   │   ├── message.ts
    │   │   │   │   ├── notification.ts
    │   │   │   │   ├── group.ts
    │   │   │   │   ├── event.ts
    │   │   │   │   ├── story.ts
    │   │   │   │   ├── search.ts
    │   │   │   │   └── admin.ts
    │   │   │   ├── root.ts
    │   │   │   └── trpc.ts
    │   │   ├── auth.ts             # NextAuth 설정
    │   │   ├── db.ts               # Prisma 클라이언트
    │   │   └── redis.ts            # Redis 클라이언트
    │   ├── socket/
    │   │   ├── server.ts           # Socket.IO 서버
    │   │   ├── handlers/           # 이벤트 핸들러
    │   │   └── client.ts           # Socket.IO 클라이언트
    │   ├── lib/
    │   │   ├── utils.ts
    │   │   ├── validations.ts      # Zod 스키마
    │   │   ├── constants.ts
    │   │   ├── upload.ts           # S3 업로드 유틸리티
    │   │   └── feed.ts             # 피드 알고리즘
    │   ├── hooks/                  # React 커스텀 훅
    │   ├── stores/                 # Zustand 스토어
    │   ├── types/                  # TypeScript 타입 정의
    │   └── styles/                 # 글로벌 스타일
    ├── workers/
    │   ├── email.worker.ts         # 이메일 발송 워커
    │   ├── media.worker.ts         # 미디어 처리 워커
    │   └── feed.worker.ts          # 피드 생성 워커
    ├── public/
    ├── tests/
    │   ├── unit/
    │   ├── integration/
    │   └── e2e/
    ├── messages/                   # i18n 번역 파일
    │   ├── ko.json
    │   └── en.json
    ├── docker-compose.yml
    ├── Dockerfile
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
    ```
  </folder_structure>
</key_implementation_notes>

</project_specification>
