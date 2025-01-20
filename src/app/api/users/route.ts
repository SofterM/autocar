// app/api/users/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let query = 'SELECT id, email, first_name, last_name, role, phone FROM users';
        const params: any[] = [];

        if (role) {
            query += ' WHERE role = ?';
            params.push(role);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.execute(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
