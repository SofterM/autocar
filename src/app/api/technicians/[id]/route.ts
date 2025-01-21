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
        const { name, position, status } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update technician
        await connection.execute(
            `UPDATE technicians 
             SET name = ?, position = ?, status = ?
             WHERE id = ?`,
            [name, position, status, id]
        );

        // If status is changed to inactive, update user role back to staff
        if (status === 'inactive') {
            await connection.execute(
                `UPDATE users u
                 JOIN technicians t ON u.id = t.user_id
                 SET u.role = 'staff'
                 WHERE t.id = ?`,
                [id]
            );
        } else if (status === 'active') {
            await connection.execute(
                `UPDATE users u
                 JOIN technicians t ON u.id = t.user_id
                 SET u.role = 'technician'
                 WHERE t.id = ?`,
                [id]
            );
        }

        await connection.commit();

        return NextResponse.json({ message: 'Technician updated successfully' });

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

        // First update technician status to inactive
        await connection.execute(
            'UPDATE technicians SET status = ? WHERE id = ?',
            ['inactive', id]
        );

        // Update user role back to staff
        await connection.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            ['staff', technician.user_id]
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