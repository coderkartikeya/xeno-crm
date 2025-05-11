import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth"; // your custom auth config
import dbConnect from "@/app/lib/db"; // utility for MongoDB connection
import Brand from "../../../../models/Brand"; // Mongoose model

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email,image, ...rest } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    // Check if user exists
    let user = await Brand.findOne({ email });

    if (!user) {
      user = new Brand({
        name,
        email,
        image,
        lastLogin: new Date(),
        ...rest,
      });
    } else {
      Object.assign(user, rest);
    }
    console.log(user);

    await user.save();

    return NextResponse.json({ message: "User saved", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
