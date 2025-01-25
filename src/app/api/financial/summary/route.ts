import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'monthly';
        const year = searchParams.get('year') || new Date().getFullYear();

        connection = await pool.getConnection();
        
        let groupFormat = '';
        let dateFilter = '';

        switch (period) {
            case 'yearly':
                groupFormat = "DATE_FORMAT(r.start_date, '%Y')";
                break;
            case 'quarterly':
                groupFormat = "CONCAT(DATE_FORMAT(r.start_date, '%Y'), 'Q', QUARTER(r.start_date))";
                break;
            default: // monthly
                groupFormat = "DATE_FORMAT(r.start_date, '%Y-%m')";
        }

        dateFilter = `WHERE r.final_cost IS NOT NULL AND YEAR(r.start_date) = ${year}`;

        const query = `
            SELECT 
                ${groupFormat} as period,
                SUM(DISTINCT r.final_cost) as revenue,
                SUM(DISTINCT r.parts_cost) as expenses,
                SUM(rp.profit_amount) as part_profit
            FROM repairs r
            LEFT JOIN repair_parts rp ON r.id = rp.repair_id
            ${dateFilter}
            GROUP BY ${groupFormat}
            ORDER BY period DESC;
        `;

        const [results] = await connection.execute(query);

        const formattedData = (results as any[]).map(row => {
            let displayPeriod = row.period;
            if (period === 'quarterly') {
                const [year, quarter] = row.period.split('Q');
                displayPeriod = `ไตรมาส ${quarter}/${year}`;
            } else if (period === 'monthly') {
                displayPeriod = new Date(row.period + '-01').toLocaleDateString('th-TH', { 
                    year: 'numeric',
                    month: 'short'
                });
            }

            const revenue = Number(row.revenue) || 0;
            const expenses = Number(row.expenses) || 0;
            const partProfit = Number(row.part_profit) || 0;

            return {
                period: displayPeriod,
                revenue: revenue,
                expenses: expenses,
                profit: (revenue - expenses) + partProfit
            };
        });

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Error fetching summary data:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}