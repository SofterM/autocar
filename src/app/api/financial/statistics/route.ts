import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface PeriodStats extends RowDataPacket {
    revenue: number;
    expenses: number;
    repairs: number;
    profit: number;
}

export async function GET() {
    let connection;
    try {
        connection = await pool.getConnection();

        // Total statistics (all time)
        const [totals] = await connection.execute<PeriodStats[]>(`
            SELECT 
                COUNT(*) as repairs,
                SUM(r.final_cost) as revenue,
                SUM(r.parts_cost) as expenses,
                SUM(
                    COALESCE((
                        SELECT SUM(rp.profit_amount)
                        FROM repair_parts rp
                        WHERE rp.repair_id = r.id
                    ), 0)
                ) as part_profit
            FROM repairs r
            WHERE r.status = 'completed'
        `);

        // Current month for trends
        const [currentMonth] = await connection.execute<PeriodStats[]>(`
            SELECT 
                COUNT(*) as repairs,
                SUM(r.final_cost) as revenue,
                SUM(r.parts_cost) as expenses,
                SUM(
                    COALESCE((
                        SELECT SUM(rp.profit_amount)
                        FROM repair_parts rp
                        WHERE rp.repair_id = r.id
                    ), 0)
                ) as part_profit
            FROM repairs r
            WHERE r.status = 'completed'
            AND DATE_FORMAT(r.start_date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
        `);

        // Previous month for trends
        const [previousMonth] = await connection.execute<PeriodStats[]>(`
            SELECT 
                COUNT(*) as repairs,
                SUM(r.final_cost) as revenue,
                SUM(r.parts_cost) as expenses,
                SUM(
                    COALESCE((
                        SELECT SUM(rp.profit_amount)
                        FROM repair_parts rp
                        WHERE rp.repair_id = r.id
                    ), 0)
                ) as part_profit
            FROM repairs r
            WHERE r.status = 'completed'
            AND DATE_FORMAT(r.start_date, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m')
        `);

        const calculateTrend = (curr: number, prev: number): number => {
            if (!prev) return 0;
            return Number(((curr - prev) / prev * 100).toFixed(1));
        };

        const current = currentMonth[0];
        const previous = previousMonth[0];
        const total = totals[0];

        const response = {
            totalRevenue: Number(total?.revenue) || 0,
            totalExpenses: Number(total?.expenses) || 0,
            totalProfit: ((Number(total?.revenue) || 0) - (Number(total?.expenses) || 0)) + (Number(total?.part_profit) || 0),
            totalRepairs: Number(total?.repairs) || 0,
            revenueTrend: calculateTrend(Number(current?.revenue) || 0, Number(previous?.revenue) || 0),
            expensesTrend: calculateTrend(Number(current?.expenses) || 0, Number(previous?.expenses) || 0),
            profitTrend: calculateTrend(
                ((Number(current?.revenue) || 0) - (Number(current?.expenses) || 0) + (Number(current?.part_profit) || 0)),
                ((Number(previous?.revenue) || 0) - (Number(previous?.expenses) || 0) + (Number(previous?.part_profit) || 0))
            ),
            repairsTrend: calculateTrend(Number(current?.repairs) || 0, Number(previous?.repairs) || 0)
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}