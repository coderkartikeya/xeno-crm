import { NextResponse } from 'next/server';
import redis from '../../../lib/lib'; // Adjust the path as necessary
import { v4 as uuidv4 } from 'uuid';

const redisClient = redis;

// GET - Fetch all order campaigns
async function getOrderCampaigns() {
  try {
    const campaignKeys = await redisClient.keys('order_campaign:*');

    if (!campaignKeys.length) {
      return NextResponse.json(generateMockOrderCampaigns(), { status: 200 });
    }

    const campaignPromises = campaignKeys.map(async (key) => {
      const campaignStr = await redisClient.get(key);
      if (!campaignStr) return null;

      const campaignData = typeof campaignStr === 'string' ? JSON.parse(campaignStr) : campaignStr;

      return {
        id: key.split(':')[1],
        name: campaignData.name,
        targetAudience: campaignData.targetAudience,
        date: campaignData.date,
        status: campaignData.status,
        delivered: parseInt(campaignData.delivered || '0'),
        failed: parseInt(campaignData.failed || '0'),
        tag: campaignData.tag || 'Order Campaign',
        totalOrders: parseInt(campaignData.totalOrders || '0'),
        totalValue: parseFloat(campaignData.totalValue || '0'),
      };
    });

    let campaigns = await Promise.all(campaignPromises);
    campaigns = campaigns.filter(Boolean); // remove nulls
    campaigns.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error('Error fetching order campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new order campaign
async function handlePost(req) {
  try {
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

    await redisClient.set(`order_campaign:${campaignId}`, JSON.stringify(campaign));

    for (const order of orders) {
      const log = {
        campaignId,
        customer: order.customer,
        orderId: order.id,
        message,
        timestamp: new Date().toISOString(),
      };
      await redisClient.rpush('order_campaign_logs', JSON.stringify(log));
    }

    return NextResponse.json({ success: true, campaignId });
  } catch (error) {
    console.error('Error launching campaign:', error);
    return NextResponse.json({ error: 'Failed to launch campaign' }, { status: 500 });
  }
}

// Simulated async message delivery processor for orders
async function processOrderCampaignMessages(campaignId, orders, messageTemplate) {
  try {
    const campaignKey = `order_campaign:${campaignId}`;
    let delivered = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        const personalizedMessage = messageTemplate
          .replace(/{customer}/g, order.customer)
          .replace(/{amount}/g, order.amount)
          .replace(/{orderId}/g, order.id);

        const logId = Date.now().toString() + Math.floor(Math.random() * 1000);
        const logKey = `order_communication_log:${logId}`;
        const isDelivered = Math.random() < 0.9;
        const deliveryStatus = isDelivered ? 'SENT' : 'FAILED';

        await redisClient.hSet(logKey, {
          campaignId,
          orderId: order.id,
          customer: order.customer,
          amount: order.amount,
          message: personalizedMessage,
          status: deliveryStatus,
          timestamp: new Date().toISOString(),
        });

        if (isDelivered) delivered++;
        else failed++;

        if ((delivered + failed) % 10 === 0 || delivered + failed === orders.length) {
          const campaignData = await redisClient.get(campaignKey);
          const parsed = JSON.parse(campaignData);

          parsed.delivered = delivered.toString();
          parsed.failed = failed.toString();

          await redisClient.set(campaignKey, JSON.stringify(parsed));
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Error processing message for order ${order.id}:`, error);
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

    console.log(`Order Campaign ${campaignId} completed: ${delivered} delivered, ${failed} failed`);
  } catch (error) {
    console.error(`Error processing order campaign ${campaignId}:`, error);
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
  const logs = await redisClient.lrange('order_campaign_logs', 0, -1);
  return logs.map(log => JSON.parse(log));
}

// Next.js API route handlers
export async function GET() {
  return await getOrderCampaigns();
}

export async function POST(req) {
  return await handlePost(req);
}
