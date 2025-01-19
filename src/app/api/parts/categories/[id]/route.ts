// /app/api/parts/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM parts_categories WHERE id = ?',
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const [result] = await pool.query(
      'UPDATE parts_categories SET ? WHERE id = ?',
      [body, params.id]
    );

    if ('affectedRows' in result && result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }

    // Fetch the updated category
    const [updatedCategory] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM parts_categories WHERE id = ?',
      [params.id]
    );

    return NextResponse.json(updatedCategory[0]);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบว่ามีอะไหล่ที่ใช้หมวดหมู่นี้อยู่หรือไม่
    const [parts] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM parts WHERE category_id = ?',
      [params.id]
    );

    if (parts[0].count > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบหมวดหมู่ได้เนื่องจากมีอะไหล่ที่ใช้หมวดหมู่นี้อยู่' }, 
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'DELETE FROM parts_categories WHERE id = ?',
      [params.id]
    );

    if ('affectedRows' in result && result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' }
    );

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' }, 
      { status: 500 }
    );
  }
}