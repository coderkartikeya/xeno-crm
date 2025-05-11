import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const logs = await db.collection('order_campaign_logs').find({}).toArray();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching campaign logs:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign logs' }, { status: 500 });
  }
} 