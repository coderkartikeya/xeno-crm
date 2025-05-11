import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Papa from "papaparse";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    
    // Parse CSV
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Failed to parse CSV file", details: errors },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Transform and validate data
    const orders = data.map((row) => ({
      id: row.id || `ORD${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer: row.customer,
      date: row.date || new Date().toISOString(),
      amount: parseFloat(row.amount) || 0,
      status: row.status || "pending",
      items: row.items ? row.items.split(",").map(item => item.trim()) : [],
      createdAt: new Date(),
    }));

    // Insert orders into database
    if (orders.length > 0) {
      await db.collection("orders").insertMany(orders);
    }

    return NextResponse.json({
      message: "Orders imported successfully",
      orders,
    });
  } catch (error) {
    console.error("Error importing orders:", error);
    return NextResponse.json(
      { error: "Failed to import orders" },
      { status: 500 }
    );
  }
} 