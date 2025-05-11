// app/api/auth/[...nextauth]/route.js or pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
