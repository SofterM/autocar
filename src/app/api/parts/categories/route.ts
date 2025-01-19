// /app/api/parts/categories/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [categories] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM parts_categories ORDER BY name'
    );
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const [result] = await pool.query(
      'INSERT INTO parts_categories SET ?',
      [body]
    );

    if ('insertId' in result) {
      const [newCategory] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM parts_categories WHERE id = ?',
        [result.insertId]
      );
      return NextResponse.json(newCategory[0]);
    }

    return NextResponse.json(
      { error: 'Failed to create category' }, 
      { status: 500 }
    );

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' }, 
      { status: 500 }
    );
  }
}