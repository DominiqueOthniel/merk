export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/anki/:path*",
    "/review/:path*",
    "/dashboard/:path*",
    "/challenge/:path*",
    "/exam/:path*",
    "/placement/:path*",
    "/admin/:path*",
  ],
};
