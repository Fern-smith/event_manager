import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow all routes for now
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/auth")) {
          return true;
        }
        // Allow access to public pages
        if (req.nextUrl.pathname === "/") {
          return true;
        }
        // Require token for other pages
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/events/create"]
};
