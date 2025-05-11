import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

// POST - Create a new customer campaign
export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();
    const { name, targetAudience, message, customers, tag, scheduledTime } = body;
    const campaignId = uuidv4();
    const timestamp = new Date().toISOString();
    // Store campaign info
    const campaign = {
      id: campaignId,
      name,
      targetAudience,
      message,
      tag,
      scheduledTime,
      customers,
      date: timestamp,
      status: 'Completed',
      delivered: customers.length,
      failed: 0,
    };
    await db.collection('customer_campaigns').insertOne(campaign);
    // Store logs in MongoDB
    const logs = customers.map(customer => ({
      campaignId,
      customer: customer.name,
      customerId: customer.id,
      message,
      timestamp: new Date().toISOString(),
    }));
    if (logs.length > 0) {
      await db.collection('customer_campaign_logs').insertMany(logs);
    }
    return NextResponse.json({ success: true, campaignId });
  } catch (error) {
    console.error('Error launching customer campaign:', error);
    return NextResponse.json({ error: 'Failed to launch customer campaign' }, { status: 500 });
  }
}

// Helper to fetch all logs
export async function getAllCustomerCampaignLogs() {
  const { db } = await connectToDatabase();
  const logs = await db.collection('customer_campaign_logs').find({}).toArray();
  return logs.map(log => log);
} 