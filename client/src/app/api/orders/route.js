import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.email;
    const { db } = await connectToDatabase();
    // Fetch orders for this user
    const orders = await db.collection("orders").find({ userId }).toArray();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.email;
    const { db } = await connectToDatabase();
    const orderData = await request.json();
    // Validate order data
    if (!orderData.customer || !orderData.items || !orderData.amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Add timestamp, status, and userId
    const newOrder = {
      ...orderData,
      userId,
      date: new Date().toISOString(),
      status: "pending",
      createdAt: new Date(),
    };
    // Insert order into MongoDB
    const result = await db.collection("orders").insertOne(newOrder);
    return NextResponse.json({
      message: "Order created successfully",
      orderId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
} 