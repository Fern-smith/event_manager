import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect certain routes
        if (
          req.nextUrl.pathname.startsWith("/api/events") &&
          req.method === "POST"
        ) {
          return !!token;
        }
        if (req.nextUrl.pathname.startsWith("/api/bookings")) {
          return !!token;
        }
        return true;
      }
    }
  }
);

export const config = {
  matcher: ["/api/events/:path*", "/api/bookings/:path*", "/dashboard/:path*"]
};
