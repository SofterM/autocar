// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');

        let query = `
            SELECT 
                a.*,
                u.first_name,
                u.last_name,
                u.phone
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const params: unknown[] = [];

        if (userId) {
            query += ' AND a.user_id = ?';
            params.push(userId);
        }

        if (date) {
            query += ' AND DATE(a.appointment_date) = ?';
            params.push(date);
        }

        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

        const [rows] = await pool.execute(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch appointments' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, service, appointment_date, appointment_time } = body;

        // ตรวจสอบว่าเวลาว่างไหม
        const [existing] = await pool.execute(
            'SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ?',
            [appointment_date, appointment_time]
        );

        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json(
                { error: 'เวลาที่เลือกไม่ว่าง กรุณาเลือกเวลาอื่น' },
                { status: 400 }
            );
        }

        // สร้างการจอง
        const [result] = await pool.execute(
            'INSERT INTO appointments (user_id, service, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
            [user_id, service, appointment_date, appointment_time]
        );

        return NextResponse.json({
            success: true,
            message: 'สร้างการจองเรียบร้อยแล้ว',
            data: result
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Failed to create appointment' },
            { status: 500 }
        );
    }
}