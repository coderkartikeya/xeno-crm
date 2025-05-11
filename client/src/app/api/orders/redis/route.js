import { NextResponse } from 'next/server';
import redis from '../../../lib/lib';
import Papa from 'papaparse';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const records = parsed.data.map((row) => ({
      id: row.id || `ORD${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer: row.customer || 'Unknown Customer',
      date: row.date || new Date().toISOString(),
      amount: Number(row.amount || 0),
      status: row.status || 'pending',
      items: row.items ? row.items.split(',').map(item => item.trim()) : [],
      createdAt: new Date().toISOString(),
    }));

    // Store in Redis with 1-hour TTL
    await redis.set('orders', JSON.stringify(records), 'EX', 3600);

    return NextResponse.json({ orders: records });
  } catch (error) {
    console.error('Error processing orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cached = await redis.get('orders');
    if (cached) {
      return NextResponse.json({ orders: JSON.parse(cached), source: 'redis' });
    }
    return NextResponse.json({ orders: [], source: 'empty' });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { orders } = await req.json();
    
    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders data' }, { status: 400 });
    }

    // Store in Redis with 1-hour TTL
    await redis.set('orders', JSON.stringify(orders), 'EX', 3600);

    return NextResponse.json({ orders, message: 'Orders updated successfully' });
  } catch (error) {
    console.error('Error updating orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await redis.del('orders');
    return NextResponse.json({ message: 'Orders cleared successfully' });
  } catch (error) {
    console.error('Error clearing orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 