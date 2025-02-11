import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const query = `
            SELECT
                CAST(t.id AS CHAR) as id,
                t.name,
                t.position
            FROM technicians t
            WHERE t.status = 'active'
            ORDER BY t.name ASC
        `;

        const [rows] = await pool.execute(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching active technicians:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active technicians' },
            { status: 500 }
        );
    }
}