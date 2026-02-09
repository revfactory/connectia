# Connectia

Facebook 스타일의 소셜 네트워킹 플랫폼

## Claude Code 실험 프로젝트

이 프로젝트는 **Claude Code**를 활용하여 대규모 풀스택 웹 애플리케이션을 얼마나 빠르게 구현할 수 있는지 실험하기 위해 만들어졌습니다.

[`project-spec-writer`](https://github.com/anthropics/claude-code) 스킬을 사용해 프로젝트 스펙(`CONNECTIA_SPEC.md`)을 정의하고, 정의된 스펙을 기반으로 구현을 진행하였습니다. 전체 구현에 약 **1시간 20분**이 소요되었으며, 일부 미구현 기능은 추후 작업이 필요합니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| **프레임워크** | Next.js 16 (App Router, Turbopack) |
| **언어** | TypeScript 5.9 |
| **스타일링** | Tailwind CSS 4 + CSS Variables 테마 시스템 |
| **API** | tRPC 11 (superjson) |
| **인증** | NextAuth v5 (JWT + PrismaAdapter) |
| **ORM** | Prisma 6 (PostgreSQL) |
| **상태관리** | Zustand 5 + TanStack Query 5 |
| **실시간** | Socket.IO 4 |
| **검색** | Meilisearch 1.7 |
| **캐시** | Redis 7 |
| **애니메이션** | Framer Motion 12 |
| **UI** | shadcn/ui 스타일 (cva + clsx + tailwind-merge) |

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/                    # 인증 (로그인, 회원가입)
│   ├── (main)/                    # 메인 앱
│   │   ├── feed/                  # 뉴스피드
│   │   ├── profile/[username]/    # 프로필
│   │   ├── friends/               # 친구
│   │   ├── messages/              # 메시지
│   │   ├── notifications/         # 알림
│   │   ├── search/                # 검색
│   │   ├── groups/                # 그룹
│   │   ├── events/                # 이벤트
│   │   ├── settings/              # 설정
│   │   └── admin/                 # 관리자 대시보드
│   └── api/                       # tRPC + NextAuth API
├── components/                    # UI 컴포넌트 (50+)
├── server/
│   ├── api/routers/               # tRPC 라우터 11개
│   ├── auth.ts                    # NextAuth 설정
│   └── db.ts                      # Prisma 클라이언트
├── hooks/                         # 커스텀 훅
├── lib/                           # 유틸리티
└── types/                         # 타입 정의
```

## 주요 기능

- **뉴스피드** — 게시물 작성 (텍스트/이미지/동영상), 리액션 6종, 댓글/대댓글
- **프로필** — 커버 이미지, 소개, 타임라인, 친구 목록
- **친구 시스템** — 친구 요청, 수락/거절, 추천
- **실시간 메시징** — 1:1 및 그룹 대화, 읽음 표시, 타이핑 인디케이터
- **알림** — 실시간 알림 드롭다운, 읽음/안읽음 관리
- **스토리** — 24시간 임시 게시물, 스토리 링, 뷰어
- **검색** — 사용자/게시물 통합 검색
- **그룹** — 그룹 생성, 멤버 관리, 그룹 게시물
- **이벤트** — 이벤트 생성, 참석/관심 표시
- **설정** — 프로필, 개인정보, 알림, 보안 설정
- **관리자** — 대시보드 통계, 사용자/신고 관리
- **다크모드** — 시스템/라이트/다크 테마 전환

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/connectia.git
cd connectia

# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에서 NEXTAUTH_SECRET 등 필요한 값 설정

# Docker 서비스 실행 (PostgreSQL, Redis, Meilisearch)
docker compose up -d

# Prisma 클라이언트 생성 및 DB 마이그레이션
pnpm db:generate
pnpm db:push

# 시드 데이터 삽입 (테스트 사용자 5명 + 샘플 데이터)
pnpm db:seed

# 개발 서버 실행
pnpm dev
```

`http://localhost:3000`에서 접속 가능합니다.

### 시드 계정

| 이름 | 이메일 | 비밀번호 |
|------|--------|----------|
| Admin | admin@connectia.com | password123 |
| Robin | robin@connectia.com | password123 |
| Alice | alice@connectia.com | password123 |
| Bob | bob@connectia.com | password123 |
| Charlie | charlie@connectia.com | password123 |

## 환경변수

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/connectia?schema=public"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="connectia-dev-key"
```

## 미구현 기능

현재 프로토타입 단계로, 다음 기능들이 추후 구현이 필요합니다:

### Mock 데이터 → 실제 API 연동
- 뉴스피드 게시물 목록 (tRPC useInfiniteQuery)
- 친구 요청/추천 목록
- 사이드바 사용자 정보 (세션 연동)
- 온라인 친구 목록

### Mutation 미연결
- 게시물 작성 (post.create)
- 댓글 작성 (comment.create)
- 친구 요청 수락/거절/보내기
- 프로필 수정

### 인프라 기능
- Socket.IO 서버 핸들러 (`/api/socketio`)
- Meilisearch 연동 (현재 Prisma contains 임시 사용)
- 실시간 알림 수신 (Socket.IO)

### UI 기능
- 스토리 생성 모달
- 무한 스크롤 (Intersection Observer)
- 그룹 게시물 연동
- 마켓플레이스 페이지

## 스크립트

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm db:generate  # Prisma 클라이언트 생성
pnpm db:push      # DB 스키마 동기화
pnpm db:migrate   # DB 마이그레이션
pnpm db:studio    # Prisma Studio
pnpm db:seed      # 시드 데이터 삽입
```

## 라이선스

ISC
