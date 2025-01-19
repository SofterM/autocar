// D:\Github\autocar\src\app\api\parts\route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Part } from '@/types/parts';

type QueryParam = string | number;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    let query = `SELECT p.*, c.name as category_name 
                 FROM parts p 
                 LEFT JOIN parts_categories c ON p.category_id = c.id
                 WHERE 1=1`;
    const queryParams: QueryParam[] = [];
    
    if (category) {
      query += ` AND p.category_id = ?`;
      queryParams.push(category);
    }
    
    if (search) {
      query += ` AND (p.name LIKE ? OR p.code LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
    return NextResponse.json(rows);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parts' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Omit<Part, 'id' | 'created_at' | 'updated_at'>;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO parts SET ?',
      [body]
    );

    if (result.insertId) {
      const [newPart] = await pool.query<RowDataPacket[]>(
        `SELECT p.*, c.name as category_name 
         FROM parts p 
         LEFT JOIN parts_categories c ON p.category_id = c.id 
         WHERE p.id = ?`,
        [result.insertId]
      );

      return NextResponse.json(newPart[0]);
    }

    return NextResponse.json(
      { error: 'Failed to create part' }, 
      { status: 500 }
    );

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create part' }, 
      { status: 500 }
    );
  }
}