// app/api/upload-csv/route.js (or .ts if using TypeScript)
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Papa from 'papaparse';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.email;
    const { db } = await connectToDatabase();
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
      ...row,
      userId,
      totalSpend: Number(row.totalSpend || 0),
      loyaltyPoints: Number(row.loyaltyPoints || 0),
      visits: Number(row.visits || 0),
    }));

    // Insert or update customers in MongoDB
    for (const customer of records) {
      await db.collection('customers').updateOne(
        { email: customer.email, userId },
        { $set: customer },
        { upsert: true }
      );
    }

    return NextResponse.json({ customers: records });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.email;
    const { db } = await connectToDatabase();
    const customers = await db.collection('customers').find({ userId }).toArray();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ customers: [], error: 'Internal Server Error' }, { status: 500 });
  }
}

