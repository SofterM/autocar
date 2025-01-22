// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, OkPacket } from 'mysql2';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, service, appointment_date, appointment_time, status } = body;

        // ตรวจสอบว่าเวลาที่เลือกว่างหรือไม่
        const [existingAppointments] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ?',
            [appointment_date, appointment_time]
        );

        if (existingAppointments.length > 0) {
            return NextResponse.json(
                { error: 'เวลาที่เลือกไม่ว่าง กรุณาเลือกเวลาอื่น' },
                { status: 400 }
            );
        }

        // สร้างการจองใหม่
        const [result] = await pool.execute<OkPacket>(
            'INSERT INTO appointments (user_id, service, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, service, appointment_date, appointment_time, status]
        );

        return NextResponse.json({
            success: true,
            message: 'สร้างการจองเรียบร้อยแล้ว',
            appointmentId: result.insertId
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Failed to create appointment' },
            { status: 500 }
        );
    }
}