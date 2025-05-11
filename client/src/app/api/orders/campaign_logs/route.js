import { NextResponse } from 'next/server';
import redis from '../../../lib/lib'; // Adjust the path as necessary

export async function GET() {
  try {
    const logs = await redis.lrange('order_campaign_logs', 0, -1);
    const parsedLogs = logs.map(log => JSON.parse(log));
    return NextResponse.json({ logs: parsedLogs });
  } catch (error) {
    console.error('Error fetching campaign logs:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign logs' }, { status: 500 });
  }
} 