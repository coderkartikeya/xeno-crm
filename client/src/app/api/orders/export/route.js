import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Parser } from "json2csv";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch orders from MongoDB
    const orders = await db.collection("orders").find({}).toArray();
    
    // Define CSV fields
    const fields = [
      "id",
      "customer",
      "date",
      "amount",
      "status",
      "items",
      "createdAt",
    ];
    
    // Create CSV parser
    const json2csvParser = new Parser({ fields });
    
    // Convert orders to CSV
    const csv = json2csvParser.parse(orders);
    
    // Set response headers for CSV download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set(
      "Content-Disposition",
      'attachment; filename="orders.csv"'
    );
    
    return new NextResponse(csv, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error exporting orders:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
} 