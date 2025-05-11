import { v4 as uuidv4 } from 'uuid';
import redis from '../../../lib/lib';

export async function POST(req) {
  try {
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
    await redis.set(`customer_campaign:${campaignId}`, JSON.stringify(campaign));
    // Send dummy message and log for each customer
    for (const customer of customers) {
      const log = {
        campaignId,
        customer: customer.name,
        customerId: customer.id,
        message,
        timestamp: new Date().toISOString(),
      };
      await redis.rpush('customer_campaign_logs', JSON.stringify(log));
    }
    return NextResponse.json({ success: true, campaignId });
  } catch (error) {
    console.error('Error launching customer campaign:', error);
    return NextResponse.json({ error: 'Failed to launch customer campaign' }, { status: 500 });
  }
}

// Helper to fetch all logs
export async function getAllCustomerCampaignLogs() {
  const logs = await redis.lrange('customer_campaign_logs', 0, -1);
  return logs.map(log => JSON.parse(log));
} 