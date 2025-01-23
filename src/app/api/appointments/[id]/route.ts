// src/app/api/appointments/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { OkPacket, RowDataPacket } from 'mysql2';

interface AppointmentRow extends RowDataPacket {
    id: number;
    user_id: number;
    service: string;
    appointment_date: Date;
    appointment_time: string;
    status: string;
    first_name: string;
    last_name: string;
    phone: string;
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const [rows] = await pool.execute<AppointmentRow[]>(
            `SELECT 
                a.*,
                u.first_name,
                u.last_name,
                u.phone
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = ?`,
            [params.id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Appointment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch appointment' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { status } = body;

        const [result] = await pool.execute<OkPacket>(
            'UPDATE appointments SET status = ? WHERE id = ?',
            [status, params.id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'Appointment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'อัพเดทสถานะเรียบร้อยแล้ว'
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json(
            { error: 'Failed to update appointment' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await pool.execute('DELETE FROM appointments WHERE id = ?', [params.id]);
        return NextResponse.json({
            success: true,
            message: 'ลบการจองเรียบร้อยแล้ว'
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json(
            { error: 'Failed to delete appointment' },
            { status: 500 }
        );
    }
}