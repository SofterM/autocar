// src/app/api/contact-channels/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const ContactChannelSchema = z.object({
  id: z.string().optional(),
  facebook: z.string(),
  line: z.string(),
  email: z.string().email(),
  technician_phone: z.string(),
  manager_phone: z.string(),
  address: z.string()
});

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_channels');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ContactChannelSchema.parse(body);
    const id = uuidv4();
    
    await pool.query(
      `INSERT INTO contact_channels (
        id, facebook, line, email, technician_phone, manager_phone, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validatedData.facebook,
        validatedData.line,
        validatedData.email,
        validatedData.technician_phone,
        validatedData.manager_phone,
        validatedData.address
      ]
    );
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ContactChannelSchema.parse(body);
    
    await pool.query(
      `UPDATE contact_channels SET 
        facebook = ?,
        line = ?,
        email = ?,
        technician_phone = ?,
        manager_phone = ?,
        address = ?
      WHERE id = ?`,
      [
        validatedData.facebook,
        validatedData.line,
        validatedData.email,
        validatedData.technician_phone,
        validatedData.manager_phone,
        validatedData.address,
        validatedData.id
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}