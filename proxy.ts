import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/products(.*)', '/about'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const session = await auth()

  // Admin route check
  if (isAdminRoute(req)) {
    if (session.userId !== process.env.ADMIN_USER_ID) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protected route check
  if (!isPublicRoute(req) && !session.userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
}
