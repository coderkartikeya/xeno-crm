import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function POST(request) {
  try {
    const { apiLink } = await request.json();

    if (!apiLink) {
      return NextResponse.json(
        { error: "No API link provided" },
        { status: 400 }
      );
    }

    // Fetch data from external API
    const response = await fetch(apiLink);
    if (!response.ok) {
      throw new Error(`Failed to fetch from API: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Connect to database
    const { db } = await connectToDatabase();

    // Transform and validate data
    const orders = Array.isArray(data) ? data : [data];
    const transformedOrders = orders.map((order) => ({
      id: order.id || `ORD${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer: order.customer || order.customerName || "Unknown Customer",
      date: order.date || order.orderDate || new Date().toISOString(),
      amount: parseFloat(order.amount || order.total || 0),
      status: order.status || "pending",
      items: Array.isArray(order.items) 
        ? order.items 
        : order.items 
          ? order.items.split(",").map(item => item.trim())
          : [],
      createdAt: new Date(),
    }));

    // Insert orders into database
    if (transformedOrders.length > 0) {
      await db.collection("orders").insertMany(transformedOrders);
    }

    return NextResponse.json({
      message: "Orders imported successfully",
      orders: transformedOrders,
    });
  } catch (error) {
    console.error("Error importing orders from API:", error);
    return NextResponse.json(
      { error: "Failed to import orders from API" },
      { status: 500 }
    );
  }
} 