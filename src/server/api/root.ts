import { createCallerFactory, createTRPCRouter } from './trpc'
import { userRouter } from './routers/user'
import { postRouter } from './routers/post'
import { friendshipRouter } from './routers/friendship'
import { notificationRouter } from './routers/notification'
import { messageRouter } from './routers/message'
import { storyRouter } from './routers/story'
import { searchRouter } from './routers/search'
import { groupRouter } from './routers/group'
import { eventRouter } from './routers/event'
import { settingsRouter } from './routers/settings'
import { adminRouter } from './routers/admin'

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  friendship: friendshipRouter,
  notification: notificationRouter,
  message: messageRouter,
  story: storyRouter,
  search: searchRouter,
  group: groupRouter,
  event: eventRouter,
  settings: settingsRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
export const createCaller = createCallerFactory(appRouter)
