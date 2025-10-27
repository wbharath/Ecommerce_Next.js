import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/products(.*)', '/about'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth() // Make async and await

  const isAdminUser = userId === process.env.ADMIN_USER_ID

  if (isAdminRoute(req) && !isAdminUser) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // For protected routes, redirect to sign-in if not authenticated
  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
