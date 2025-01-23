import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket, OkPacket } from 'mysql2';

interface AppointmentRow extends RowDataPacket {
    id: number;
    user_id: number;
    service: string;
    repair_details: string;
    appointment_date: Date;
    appointment_time: string;
    status: string;
    firstName: string;
    lastName: string;
    phone: string;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');

        let query = `
            SELECT 
                a.*,
                u.first_name as firstName,
                u.last_name as lastName,
                u.phone
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (year && month) {
            query += ' AND YEAR(a.appointment_date) = ? AND MONTH(a.appointment_date) = ?';
            params.push(year, month);
        }

        if (userId) {
            query += ' AND a.user_id = ?';
            params.push(userId);
        }

        if (date) {
            query += ' AND DATE(a.appointment_date) = ?';
            params.push(date);
        }

        query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

        const [rows] = await pool.execute<AppointmentRow[]>(query, params);

        const appointments = rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            service: row.service,
            repair_details: row.repair_details,
            appointment_date: row.appointment_date,
            appointment_time: row.appointment_time,
            status: row.status || 'pending',
            user: {
                firstName: row.firstName,
                lastName: row.lastName,
                phone: row.phone
            }
        }));

        return NextResponse.json(appointments);

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
        const { user_id, service, repair_details, appointment_date, appointment_time } = body;

        const [existing] = await pool.execute<AppointmentRow[]>(
            'SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
            [appointment_date, appointment_time]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'เวลาที่เลือกไม่ว่าง กรุณาเลือกเวลาอื่น' },
                { status: 400 }
            );
        }

        await pool.execute<OkPacket>(
            'INSERT INTO appointments (user_id, service, repair_details, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, service, repair_details, appointment_date, appointment_time, 'pending']
        );

        return NextResponse.json({
            success: true,
            message: 'สร้างการจองเรียบร้อยแล้ว'
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Failed to create appointment' },
            { status: 500 }
        );
    }
}