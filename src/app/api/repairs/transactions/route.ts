// src/app/api/repairs/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { formatBigInt } from '@/lib/db-utils';

interface TransactionRow extends RowDataPacket {
  id: bigint;
  repair_id: bigint;
  service_name: string;
  created_at: Date;
  total_price: number;
  type: 'income' | 'expense';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const [rows] = await pool.execute<TransactionRow[]>(`
      SELECT 
        r.id,
        r.id as repair_id,
        r.description as service_name,
        r.created_at,
        r.final_cost as total_price,
        'income' as type
      FROM repairs r
      WHERE r.final_cost IS NOT NULL 
      AND r.status = 'completed'
      ORDER BY r.created_at DESC
      LIMIT ${limit}
    `);

    const formattedRows = rows.map(row => ({
      ...row,
      id: formatBigInt(row.id),
      repair_id: formatBigInt(row.repair_id),
      total_price: Number(row.total_price)
    }));

    return NextResponse.json(formattedRows);

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการ' },
      { status: 500 }
    );
  }
}