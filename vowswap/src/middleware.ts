import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Handle requests here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/addresses/:path*",
    "/api/user/:path*",
    "/api/addresses/:path*",
    "/api/orders/:path*",
  ],
};
