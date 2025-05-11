import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch orders from MongoDB
    const orders = await db.collection("orders").find({}).toArray();
    
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
    const { db } = await connectToDatabase();
    const orderData = await request.json();
    
    // Validate order data
    if (!orderData.customer || !orderData.items || !orderData.amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Add timestamp and status
    const newOrder = {
      ...orderData,
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