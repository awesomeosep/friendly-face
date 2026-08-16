import { orgRouter } from './routers/orgs'
import { userRouter } from './routers/user'

export const router = {
  org: orgRouter,
  user: userRouter
}