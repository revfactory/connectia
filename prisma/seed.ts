import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('시드 데이터 생성을 시작합니다...')

  // 기존 데이터 삭제 (외래 키 의존성 순서대로)
  await prisma.storyView.deleteMany()
  await prisma.story.deleteMany()
  await prisma.eventAttendee.deleteMany()
  await prisma.event.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.group.deleteMany()
  await prisma.report.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversationMember.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.reaction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.friendship.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  console.log('기존 데이터가 삭제되었습니다.')

  // 비밀번호 해싱
  const passwordHash = await hash('password123', 12)

  // ========== 사용자 5명 생성 ==========
  const admin = await prisma.user.create({
    data: {
      email: 'admin@connectia.kr',
      passwordHash,
      username: 'admin',
      displayName: '관리자',
      bio: 'Connectia 관리자입니다. 문의사항은 메시지로 보내주세요.',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=admin',
      location: '서울특별시',
      role: 'ADMIN',
      isVerified: true,
    },
  })

  const robin = await prisma.user.create({
    data: {
      email: 'robin@connectia.kr',
      passwordHash,
      username: 'robin',
      displayName: '김로빈',
      bio: '풀스택 개발자입니다. Next.js와 TypeScript를 좋아합니다.',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=robin',
      location: '서울특별시 강남구',
      role: 'USER',
      isVerified: true,
    },
  })

  const alice = await prisma.user.create({
    data: {
      email: 'alice@connectia.kr',
      passwordHash,
      username: 'alice',
      displayName: '이앨리스',
      bio: 'UX 디자이너 | 커피 러버 | 여행 좋아하는 사람',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=alice',
      location: '서울특별시 마포구',
      role: 'USER',
      isVerified: false,
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@connectia.kr',
      passwordHash,
      username: 'bob',
      displayName: '박밥',
      bio: '백엔드 개발자 | 오픈소스 기여자 | 독서 매니아',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=bob',
      location: '경기도 성남시',
      role: 'USER',
      isVerified: false,
    },
  })

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@connectia.kr',
      passwordHash,
      username: 'charlie',
      displayName: '정찰리',
      bio: '데이터 엔지니어 | 러닝 크루 | 맛집 탐방가',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=charlie',
      location: '부산광역시',
      role: 'USER',
      isVerified: true,
    },
  })

  console.log('사용자 5명이 생성되었습니다.')

  // ========== 친구 관계 생성 ==========
  await prisma.friendship.createMany({
    data: [
      {
        requesterId: robin.id,
        addresseeId: alice.id,
        status: 'ACCEPTED',
      },
      {
        requesterId: robin.id,
        addresseeId: bob.id,
        status: 'ACCEPTED',
      },
      {
        requesterId: alice.id,
        addresseeId: charlie.id,
        status: 'ACCEPTED',
      },
    ],
  })

  console.log('친구 관계 3개가 생성되었습니다.')

  // ========== 게시물 10개 생성 ==========
  const post1 = await prisma.post.create({
    data: {
      authorId: robin.id,
      content: '오늘 Next.js 16으로 프로젝트를 시작했는데 정말 빠르네요! Turbopack의 성능이 인상적입니다.',
      contentPlainText: '오늘 Next.js 16으로 프로젝트를 시작했는데 정말 빠르네요! Turbopack의 성능이 인상적입니다.',
      type: 'TEXT',
      audience: 'PUBLIC',
      likeCount: 24,
      commentCount: 3,
      shareCount: 2,
    },
  })

  const post2 = await prisma.post.create({
    data: {
      authorId: alice.id,
      content: '주말에 한강공원에서 피크닉 했어요! 날씨가 너무 좋았습니다. 봄바람이 살랑살랑 불어서 기분이 최고였어요.',
      contentPlainText: '주말에 한강공원에서 피크닉 했어요! 날씨가 너무 좋았습니다.',
      type: 'TEXT',
      audience: 'PUBLIC',
      feeling: '행복한',
      location: '서울 한강공원',
      likeCount: 42,
      commentCount: 5,
      shareCount: 3,
    },
  })

  const post3 = await prisma.post.create({
    data: {
      authorId: bob.id,
      content: '새로 나온 "클린 아키텍처" 번역본을 읽고 있는데, 정말 좋습니다. 소프트웨어 설계에 관심 있는 분들께 강력 추천합니다.',
      contentPlainText: '새로 나온 "클린 아키텍처" 번역본을 읽고 있는데, 정말 좋습니다.',
      type: 'TEXT',
      audience: 'PUBLIC',
      likeCount: 87,
      commentCount: 12,
      shareCount: 15,
    },
  })

  const post4 = await prisma.post.create({
    data: {
      authorId: charlie.id,
      content: '부산 해운대에서 서핑 시작했어요! 처음이라 많이 넘어졌지만 너무 재미있었습니다. 다음 주에 또 갈 예정!',
      contentPlainText: '부산 해운대에서 서핑 시작했어요!',
      type: 'TEXT',
      audience: 'PUBLIC',
      feeling: '신나는',
      location: '부산 해운대',
      likeCount: 56,
      commentCount: 8,
      shareCount: 4,
    },
  })

  const post5 = await prisma.post.create({
    data: {
      authorId: admin.id,
      content: 'Connectia 서비스 업데이트 안내: 스토리 기능과 이벤트 기능이 새롭게 추가되었습니다. 많은 이용 부탁드립니다!',
      contentPlainText: 'Connectia 서비스 업데이트 안내',
      type: 'TEXT',
      audience: 'PUBLIC',
      likeCount: 120,
      commentCount: 30,
      shareCount: 25,
    },
  })

  const post6 = await prisma.post.create({
    data: {
      authorId: robin.id,
      content: 'TypeScript 5.x의 새로운 기능들을 정리해봤습니다. 특히 데코레이터 지원이 정말 유용하네요.',
      contentPlainText: 'TypeScript 5.x의 새로운 기능들을 정리해봤습니다.',
      type: 'TEXT',
      audience: 'FRIENDS',
      likeCount: 35,
      commentCount: 7,
      shareCount: 10,
    },
  })

  await prisma.post.create({
    data: {
      authorId: alice.id,
      content: '오늘 새로운 카페를 발견했어요! 인테리어가 너무 예쁘고 커피도 맛있었습니다. 마포구에 숨은 보석 같은 곳이에요.',
      contentPlainText: '오늘 새로운 카페를 발견했어요!',
      type: 'TEXT',
      audience: 'PUBLIC',
      feeling: '뿌듯한',
      location: '서울 마포구',
      likeCount: 28,
      commentCount: 4,
      shareCount: 1,
    },
  })

  await prisma.post.create({
    data: {
      authorId: bob.id,
      content: 'Prisma 6 ORM이 성능이 정말 좋아졌네요. 특히 관계형 쿼리 최적화가 눈에 띄게 개선되었습니다.',
      contentPlainText: 'Prisma 6 ORM이 성능이 정말 좋아졌네요.',
      type: 'TEXT',
      audience: 'PUBLIC',
      likeCount: 63,
      commentCount: 15,
      shareCount: 8,
    },
  })

  await prisma.post.create({
    data: {
      authorId: charlie.id,
      content: '오늘 10km 러닝 완주했습니다! 기록도 자기 최고 기록 갱신! 꾸준히 하면 결과가 나오는 것 같아요.',
      contentPlainText: '오늘 10km 러닝 완주했습니다!',
      type: 'TEXT',
      audience: 'PUBLIC',
      feeling: '뿌듯한',
      likeCount: 95,
      commentCount: 20,
      shareCount: 5,
    },
  })

  await prisma.post.create({
    data: {
      authorId: robin.id,
      content: '개발자 밋업에서 좋은 사람들을 많이 만났어요. 네트워킹의 중요성을 다시 한 번 느꼈습니다. 다음 달에도 참석할 예정!',
      contentPlainText: '개발자 밋업에서 좋은 사람들을 많이 만났어요.',
      type: 'TEXT',
      audience: 'PUBLIC',
      location: '서울 강남구',
      likeCount: 18,
      commentCount: 3,
      shareCount: 1,
    },
  })

  console.log('게시물 10개가 생성되었습니다.')

  // ========== 댓글 5개 생성 ==========
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: alice.id,
      content: 'Turbopack 정말 빠르죠! 저도 최근에 사용해봤는데 HMR 속도가 엄청나더라고요.',
      likeCount: 5,
      replyCount: 0,
      depth: 0,
    },
  })

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: bob.id,
      content: '저도 다음 프로젝트에 적용해봐야겠어요. 좋은 정보 감사합니다!',
      likeCount: 2,
      replyCount: 0,
      depth: 0,
    },
  })

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: robin.id,
      content: '날씨 좋을 때 한강 최고죠! 다음에 같이 가요.',
      likeCount: 3,
      replyCount: 0,
      depth: 0,
    },
  })

  await prisma.comment.create({
    data: {
      postId: post3.id,
      authorId: charlie.id,
      content: '저도 읽고 있어요! 챕터 5가 특히 인상적이었습니다.',
      likeCount: 4,
      replyCount: 0,
      depth: 0,
    },
  })

  await prisma.comment.create({
    data: {
      postId: post4.id,
      authorId: alice.id,
      content: '서핑 너무 재밌어 보여요! 저도 도전해보고 싶어요.',
      likeCount: 1,
      replyCount: 0,
      depth: 0,
    },
  })

  console.log('댓글 5개가 생성되었습니다.')

  // ========== 그룹 2개 생성 ==========
  const devGroup = await prisma.group.create({
    data: {
      name: '개발자 커뮤니티',
      description:
        '프론트엔드, 백엔드, 모바일 등 모든 개발자를 위한 커뮤니티입니다. 기술 공유, 질문, 네트워킹을 함께 해요!',
      privacy: 'PUBLIC',
      creatorId: robin.id,
      memberCount: 4,
    },
  })

  const bookGroup = await prisma.group.create({
    data: {
      name: '독서 모임',
      description:
        '매주 한 권의 책을 함께 읽고 토론하는 모임입니다. 개발 서적부터 인문학까지 다양한 장르를 다룹니다.',
      privacy: 'PUBLIC',
      creatorId: bob.id,
      memberCount: 3,
    },
  })

  // 그룹 멤버 추가
  await prisma.groupMember.createMany({
    data: [
      { groupId: devGroup.id, userId: robin.id, role: 'ADMIN' },
      { groupId: devGroup.id, userId: alice.id, role: 'MEMBER' },
      { groupId: devGroup.id, userId: bob.id, role: 'MEMBER' },
      { groupId: devGroup.id, userId: charlie.id, role: 'MEMBER' },
      { groupId: bookGroup.id, userId: bob.id, role: 'ADMIN' },
      { groupId: bookGroup.id, userId: robin.id, role: 'MEMBER' },
      { groupId: bookGroup.id, userId: alice.id, role: 'MEMBER' },
    ],
  })

  console.log('그룹 2개와 멤버가 생성되었습니다.')

  // ========== 이벤트 2개 생성 ==========
  const nextjsMeetup = await prisma.event.create({
    data: {
      name: 'Next.js 밋업',
      description:
        'Next.js 최신 버전의 새로운 기능을 함께 알아보고 경험을 공유하는 밋업입니다. 초보자부터 전문가까지 모두 환영합니다!',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3시간 진행
      location: '서울특별시 강남구 테헤란로 427',
      isOnline: false,
      privacy: 'PUBLIC',
      hostId: robin.id,
      groupId: devGroup.id,
      attendeeCount: 3,
    },
  })

  const bookDiscussion = await prisma.event.create({
    data: {
      name: '독서 토론회',
      description:
        '이번 주 주제: "사피엔스" - 유발 하라리. 인류의 역사를 다양한 관점에서 토론합니다. 책을 읽지 않으셔도 참여 가능합니다.',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2주일 후
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2시간 진행
      location: '온라인 (Zoom)',
      isOnline: true,
      onlineUrl: 'https://zoom.us/j/example',
      privacy: 'PUBLIC',
      hostId: bob.id,
      groupId: bookGroup.id,
      attendeeCount: 2,
    },
  })

  // 이벤트 참석자 추가
  await prisma.eventAttendee.createMany({
    data: [
      { eventId: nextjsMeetup.id, userId: robin.id, status: 'GOING' },
      { eventId: nextjsMeetup.id, userId: alice.id, status: 'GOING' },
      { eventId: nextjsMeetup.id, userId: charlie.id, status: 'INTERESTED' },
      { eventId: bookDiscussion.id, userId: bob.id, status: 'GOING' },
      { eventId: bookDiscussion.id, userId: robin.id, status: 'GOING' },
    ],
  })

  console.log('이벤트 2개와 참석자가 생성되었습니다.')
  console.log('시드 데이터 생성이 완료되었습니다!')
}

main()
  .catch((e) => {
    console.error('시드 데이터 생성 중 오류가 발생했습니다:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
