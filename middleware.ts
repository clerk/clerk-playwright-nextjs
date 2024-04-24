import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    '/protected(.*)',
  ]);
 
export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) auth().protect();
}, {
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
});
 
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};