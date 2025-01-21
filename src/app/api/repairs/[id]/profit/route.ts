import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface ProfitData extends RowDataPacket {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const bigIntId = BigInt(id);

        const [profitData] = await pool.execute<ProfitData[]>(`
            SELECT 
                SUM(rp.total_price) as total_revenue,
                SUM(rp.cost_price * rp.quantity) as total_cost,
                SUM(rp.profit_amount) as total_profit
            FROM repair_parts rp
            WHERE rp.repair_id = ?
            GROUP BY repair_id
        `, [bigIntId]);

        return NextResponse.json(profitData[0] || null);

    } catch (error) {
        console.error('Error fetching profit data:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลกำไร' },
            { status: 500 }
        );
    }
}
