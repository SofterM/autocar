import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [results] = await connection.execute(`
            SELECT 
                DATE_FORMAT(start_date, '%Y-%m') as month,
                SUM(final_cost) as revenue,
                SUM(parts_cost) as expenses
            FROM repairs
            WHERE final_cost IS NOT NULL
            GROUP BY DATE_FORMAT(start_date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6;
        `);

        const formattedData = (results as any[]).map(row => ({
            month: new Date(row.month + '-01').toLocaleDateString('th-TH', { month: 'short' }),
            revenue: Number(row.revenue) || 0,
            expenses: Number(row.expenses) || 0,
            profit: (Number(row.revenue) || 0) - (Number(row.expenses) || 0)
        })).reverse();

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Error fetching financial data:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}