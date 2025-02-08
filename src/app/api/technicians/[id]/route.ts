// src/app/api/technicians/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, position, status, salary } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Get current technician data
        const [currentTech] = await connection.execute(
            'SELECT status FROM technicians WHERE id = ?',
            [id]
        );

        if ((currentTech as any[]).length === 0) {
            return NextResponse.json(
                { error: 'Technician not found' },
                { status: 404 }
            );
        }

        // Update technician
        await connection.execute(
            `UPDATE technicians 
             SET name = ?, position = ?, status = ?, salary = ?  # เพิ่ม salary
             WHERE id = ?`,
            [name, position, status, salary, id]  // เพิ่ม salary ในพารามิเตอร์
        );

        // Update user role only if status changed
        const currentStatus = (currentTech as any[])[0].status;
        if (currentStatus !== status) {
            await connection.execute(
                `UPDATE users u
                 JOIN technicians t ON u.id = t.user_id
                 SET u.role = ?
                 WHERE t.id = ?`,
                [status === 'active' ? 'technician' : 'staff', id]
            );
        }

        await connection.commit();
        return NextResponse.json({ 
            message: 'Technician updated successfully',
            status: status
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating technician:', error);
        return NextResponse.json(
            { error: 'Failed to update technician' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = await params;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check if technician exists and get user_id
        const [technicians] = await connection.execute(
            'SELECT user_id FROM technicians WHERE id = ?',
            [id]
        );

        if ((technicians as any[]).length === 0) {
            return NextResponse.json(
                { error: 'Technician not found' },
                { status: 404 }
            );
        }

        const technician = (technicians as any[])[0];

        // Update user role back to staff
        await connection.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            ['staff', technician.user_id]
        );

        // First delete repair assignments
        await connection.execute(
            'UPDATE repairs SET technician_id = NULL WHERE technician_id = ?',
            [id]
        );

        // Now delete the technician record
        await connection.execute(
            'DELETE FROM technicians WHERE id = ?',
            [id]
        );

        await connection.commit();

        return NextResponse.json({ 
            message: 'Technician deleted successfully'
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting technician:', error);
        return NextResponse.json(
            { error: 'Failed to delete technician' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}