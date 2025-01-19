// src/app/api/parts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Part } from '@/types/parts';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: Params
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, c.name as category_name 
       FROM parts p 
       LEFT JOIN parts_categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [context.params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Part not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch part' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: Params
) {
  try {
    const body = await request.json() as Omit<Part, 'id' | 'created_at' | 'updated_at'>;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE parts SET ? WHERE id = ?',
      [body, context.params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Part not found' }, 
        { status: 404 }
      );
    }

    // Fetch the updated part
    const [updatedPart] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, c.name as category_name 
       FROM parts p 
       LEFT JOIN parts_categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [context.params.id]
    );

    return NextResponse.json(updatedPart[0]);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update part' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: Params
) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM parts WHERE id = ?',
      [context.params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Part not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Part deleted successfully' }
    );

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete part' }, 
      { status: 500 }
    );
  }
}