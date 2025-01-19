import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Part } from '@/types/parts';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, c.name as category_name 
       FROM parts p 
       LEFT JOIN parts_categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );

    if (!rows.length) {
      return Response.json(
        { error: 'Part not found' }, 
        { status: 404 }
      );
    }

    return Response.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch part' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json() as Omit<Part, 'id' | 'created_at' | 'updated_at'>;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE parts SET ? WHERE id = ?',
      [body, id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { error: 'Part not found' }, 
        { status: 404 }
      );
    }

    const [updatedPart] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, c.name as category_name 
       FROM parts p 
       LEFT JOIN parts_categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );

    return Response.json(updatedPart[0]);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to update part' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM parts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { error: 'Part not found' }, 
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Part deleted successfully' }
    );
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to delete part' }, 
      { status: 500 }
    );
  }
}