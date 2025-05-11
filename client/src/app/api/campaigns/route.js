import { NextResponse } from 'next/server';
import redis from '@/app/lib/lib';

const redisClient = redis;

// GET - Fetch all campaigns
async function getCampaigns() {
  try {
    const campaignKeys = await redisClient.keys('campaign:*');

    if (!campaignKeys.length) {
      return NextResponse.json(generateMockCampaigns(), { status: 200 });
    }

    const campaignPromises = campaignKeys.map(async (key) => {
      const campaignStr = await redisClient.get(key);
      if (!campaignStr) return null;

      // Safely parse only if string
      const campaignData =
        typeof campaignStr === 'string' ? JSON.parse(campaignStr) : campaignStr;

      return {
        id: key.split(':')[1],
        name: campaignData.name,
        targetAudience: campaignData.targetAudience,
        date: campaignData.date,
        status: campaignData.status,
        delivered: parseInt(campaignData.delivered || '0'),
        failed: parseInt(campaignData.failed || '0'),
        tag: campaignData.tag || 'General',
      };
    });

    let campaigns = await Promise.all(campaignPromises);
    campaigns = campaigns.filter(Boolean); // remove nulls

    campaigns.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new campaign
async function createCampaign(req) {
  try {
    const body = await req.json();
    const { name, targetAudience, message, customers, tag, scheduledTime } = body;

    if (!name || !message || !customers || customers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaignId = Date.now().toString();
    const campaignKey = `campaign:${campaignId}`;

    const campaignData = {
      name,
      targetAudience: targetAudience || 'All Customers',
      date: new Date().toISOString(),
      status: 'In Progress',
      delivered: '0',
      failed: '0',
      tag: tag || 'General',
      scheduledTime: scheduledTime || new Date().toISOString(),
      totalCustomers: customers.length.toString(),
    };

    await redisClient.set(campaignKey, JSON.stringify(campaignData));

    processCampaignMessages(campaignId, customers, message);

    return NextResponse.json(
      {
        id: campaignId,
        name,
        status: 'In Progress',
        message: 'Campaign created and message delivery initiated',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Simulated async message delivery processor
async function processCampaignMessages(campaignId, customers, messageTemplate) {
  try {
    const campaignKey = `campaign:${campaignId}`;
    let delivered = 0;
    let failed = 0;

    for (const customer of customers) {
      try {
        const personalizedMessage = messageTemplate.replace(/{name}/g, customer.name);
        const logId = Date.now().toString() + Math.floor(Math.random() * 1000);
        const logKey = `communication_log:${logId}`;
        const isDelivered = Math.random() < 0.9;
        const deliveryStatus = isDelivered ? 'SENT' : 'FAILED';

        await redisClient.hSet(logKey, {
          campaignId,
          customerId: customer.id,
          customerName: customer.name,
          message: personalizedMessage,
          status: deliveryStatus,
          timestamp: new Date().toISOString(),
        });

        if (isDelivered) delivered++;
        else failed++;

        if ((delivered + failed) % 10 === 0 || delivered + failed === customers.length) {
          const campaignData = await redisClient.get(campaignKey);
          const parsed = JSON.parse(campaignData);

          parsed.delivered = delivered.toString();
          parsed.failed = failed.toString();

          await redisClient.set(campaignKey, JSON.stringify(parsed));
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Error processing message for customer ${customer.id}:`, error);
        failed++;
      }
    }

    const finalData = await redisClient.get(campaignKey);
    const parsedFinal = JSON.parse(finalData);
    parsedFinal.status = 'Completed';
    parsedFinal.delivered = delivered.toString();
    parsedFinal.failed = failed.toString();
    parsedFinal.completedAt = new Date().toISOString();

    await redisClient.set(campaignKey, JSON.stringify(parsedFinal));

    console.log(`Campaign ${campaignId} completed: ${delivered} delivered, ${failed} failed`);
  } catch (error) {
    console.error(`Error processing campaign ${campaignId}:`, error);
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
