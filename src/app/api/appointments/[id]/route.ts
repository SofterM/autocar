// src/app/api/appointments/[id]/route.ts

import pool from "@/lib/db";
import { OkPacket, RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

interface AppointmentRow extends RowDataPacket {
    id: number;
    user_id: number;
    service: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    firstName: string;
    lastName: string;
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
                u.first_name as firstName,
                u.last_name as lastName,
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

        const appointment = rows[0];
        return NextResponse.json({
            id: appointment.id,
            user_id: appointment.user_id,
            service: appointment.service,
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            status: appointment.status,
            user: {
                firstName: appointment.firstName,
                lastName: appointment.lastName,
                phone: appointment.phone
            }
        });

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

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

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
        const [result] = await pool.execute<OkPacket>(
            'DELETE FROM appointments WHERE id = ?', 
            [params.id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'Appointment not found' },
                { status: 404 }
            );
        }

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