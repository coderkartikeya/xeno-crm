import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/app/lib/mongodb';

// GET - Fetch all order campaigns
async function getOrderCampaigns() {
  try {
    const { db } = await connectToDatabase();
    const campaigns = await db.collection('order_campaigns').find({}).sort({ date: -1 }).toArray();
    if (!campaigns.length) {
      return NextResponse.json(generateMockOrderCampaigns(), { status: 200 });
    }
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error('Error fetching order campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new order campaign
async function handlePost(req) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();
    const { name, targetAudience, message, orders, tag, scheduledTime } = body;
    const campaignId = uuidv4();
    const timestamp = new Date().toISOString();
    const campaign = {
      id: campaignId,
      name,
      targetAudience,
      message,
      tag,
      scheduledTime,
      orders,
      date: timestamp,
      status: 'Completed',
      delivered: orders.length,
      failed: 0,
    };
    await db.collection('order_campaigns').insertOne(campaign);
    // Store logs in MongoDB
    const logs = orders.map(order => ({
      campaignId,
      customer: order.customer,
      orderId: order.id,
      message,
      timestamp: new Date().toISOString(),
    }));
    if (logs.length > 0) {
      await db.collection('order_campaign_logs').insertMany(logs);
    }
    return NextResponse.json({ success: true, campaignId });
  } catch (error) {
    console.error('Error launching campaign:', error);
    return NextResponse.json({ error: 'Failed to launch campaign' }, { status: 500 });
  }
}

// Mock order campaign generator
function generateMockOrderCampaigns() {
  return [
    {
      id: '1651234567890',
      name: 'High-Value Order Follow-up',
      targetAudience: 'Orders Over $500',
      date: '2024-01-15T10:30:00Z',
      status: 'Completed',
      delivered: 1240,
      failed: 110,
      tag: 'Order Follow-up',
      totalOrders: 1350,
      totalValue: 675000,
    },
    {
      id: '1651234599999',
      name: 'Pending Order Reminder',
      targetAudience: 'Pending Orders',
      date: '2024-02-20T09:15:00Z',
      status: 'Completed',
      delivered: 580,
      failed: 65,
      tag: 'Order Status',
      totalOrders: 645,
      totalValue: 322500,
    },
    {
      id: '1651234522222',
      name: 'Order Processing Update',
      targetAudience: 'Processing Orders',
      date: '2024-03-10T14:00:00Z',
      status: 'Completed',
      delivered: 1850,
      failed: 203,
      tag: 'Order Update',
      totalOrders: 2053,
      totalValue: 1026500,
    },
  ];
}

// Helper to fetch all logs
export async function getAllCampaignLogs() {
  const { db } = await connectToDatabase();
  const logs = await db.collection('order_campaign_logs').find({}).toArray();
  return logs.map(log => log);
}

// Next.js API route handlers
export async function GET() {
  return await getOrderCampaigns();
}

export async function POST(req) {
  return await handlePost(req);
}
