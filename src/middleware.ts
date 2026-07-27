export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/review/:path*",
    "/dashboard/:path*",
    "/challenge/:path*",
    "/exam/:path*",
    "/placement/:path*",
    "/admin/:path*",
  ],
};
