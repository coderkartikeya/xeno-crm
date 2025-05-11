import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/app/lib/mongodb';

// GET - Fetch all campaigns
async function getCampaigns() {
  try {
    const { db } = await connectToDatabase();
    const campaigns = await db.collection('customer_campaigns').find({}).sort({ date: -1 }).toArray();
    if (!campaigns.length) {
      return NextResponse.json(generateMockCampaigns(), { status: 200 });
    }
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new campaign
async function createCampaign(req) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();
    const { name, targetAudience, message, customers, tag, scheduledTime } = body;
    if (!name || !message || !customers || customers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const campaignId = uuidv4();
    const timestamp = new Date().toISOString();
    const campaignData = {
      id: campaignId,
      name,
      targetAudience: targetAudience || 'All Customers',
      date: timestamp,
      status: 'Completed',
      delivered: customers.length,
      failed: 0,
      tag: tag || 'General',
      scheduledTime: scheduledTime || timestamp,
      totalCustomers: customers.length,
    };
    await db.collection('customer_campaigns').insertOne(campaignData);
    // Store logs in MongoDB
    const logs = customers.map(customer => ({
      campaignId,
      customerId: customer.id,
      customerName: customer.name,
      message,
      status: 'SENT',
      timestamp: new Date().toISOString(),
    }));
    if (logs.length > 0) {
      await db.collection('customer_campaign_logs').insertMany(logs);
    }
    return NextResponse.json({
      id: campaignId,
      name,
      status: 'Completed',
      message: 'Campaign created and message delivery logged',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mock campaign generator
function generateMockCampaigns() {
  return [
    {
      id: '1651234567890',
      name: 'Winter Sale Promotion',
      targetAudience: 'High Spenders',
      date: '2024-01-15T10:30:00Z',
      status: 'Completed',
      delivered: 1240,
      failed: 110,
      tag: 'Promotional',
    },
    {
      id: '1651234599999',
      name: 'Re-engage Inactive Users',
      targetAudience: 'Inactive Users',
      date: '2024-02-20T09:15:00Z',
      status: 'Completed',
      delivered: 580,
      failed: 65,
      tag: 'Win-back',
    },
    {
      id: '1651234522222',
      name: 'New Product Launch',
      targetAudience: 'All Customers',
      date: '2024-03-10T14:00:00Z',
      status: 'Completed',
      delivered: 1850,
      failed: 203,
      tag: 'Product Launch',
    },
  ];
}

// Next.js API route handlers
export async function GET() {
  return await getCampaigns();
}

export async function POST(req) {
  return await createCampaign(req);
}
