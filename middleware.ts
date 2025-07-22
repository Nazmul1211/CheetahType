import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect profile route - this requires authentication
  if (pathname.startsWith('/profile')) {
    // Check for Firebase auth token cookie
    const firebaseAuthToken = request.cookies.get("firebase-auth-token");
    
    // Skip middleware check in development to make testing easier
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
    
    if (!firebaseAuthToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};