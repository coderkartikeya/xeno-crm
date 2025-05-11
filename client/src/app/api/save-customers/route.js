// app/api/upload-csv/route.js (or .ts if using TypeScript)
import { NextResponse } from 'next/server';
import redis from '../../lib/lib';
import Papa from 'papaparse';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text(); // Read text content of the file

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const records = parsed.data.map((row) => ({
      ...row,
      totalSpend: Number(row.totalSpend || 0),
      loyaltyPoints: Number(row.loyaltyPoints || 0),
      visits: Number(row.visits || 0),
    }));

    // Store in Redis with 1-hour TTL
    await redis.set('customers', JSON.stringify(records), 'EX', 3600);

    return NextResponse.json({ customers: records });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function GET() {
  const cached = await redis.get('customers');
  if (cached) {
    return NextResponse.json({ customers: JSON.parse(cached), source: 'redis' });
  }
  return NextResponse.json({ customers: [], source: 'empty' });
}

