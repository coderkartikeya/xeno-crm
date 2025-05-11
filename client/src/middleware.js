import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: [
    "/segments/:path*",
    "/campaigns/:path*",
    // add more protected routes here
  ],
}; 