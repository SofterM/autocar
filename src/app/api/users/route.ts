// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let query = 'SELECT id, email, first_name, last_name, role, phone FROM users WHERE 1=1';
        const params: any[] = [];

        // ไม่แสดงผู้ใช้ที่เป็นช่างแล้ว หรือช่างที่ถูกปิดการใช้งาน
        query += ` AND NOT EXISTS (
            SELECT 1 FROM technicians t 
            WHERE t.user_id = users.id AND t.status = 'active'
        )`;

        if (role) {
            query += ' AND role = ?';
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