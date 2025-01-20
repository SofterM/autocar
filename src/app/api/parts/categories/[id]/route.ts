// D:\Github\autocar\src\app\api\parts\categories\[id]\route.ts
import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM parts_categories WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return Response.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }

    return Response.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch category' }, 
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
    const body = await request.json();

    const [result] = await pool.query(
      'UPDATE parts_categories SET ? WHERE id = ?',
      [body, id]
    );

    if ('affectedRows' in result && result.affectedRows === 0) {
      return Response.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }

    const [updatedCategory] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM parts_categories WHERE id = ?',
      [id]
    );

    return Response.json(updatedCategory[0]);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to update category' }, 
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

    const [parts] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM parts WHERE category_id = ?',
      [id]
    );

    if (parts[0].count > 0) {
      return Response.json(
        { error: 'ไม่สามารถลบหมวดหมู่ได้เนื่องจากมีอะไหล่ที่ใช้หมวดหมู่นี้อยู่' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'DELETE FROM parts_categories WHERE id = ?',
      [id]
    );

    if ('affectedRows' in result && result.affectedRows === 0) {
      return Response.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Category deleted successfully' }
    );
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to delete category' }, 
      { status: 500 }
    );
  }
}