// src/app/api/technicians/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const query = `
            SELECT 
                CAST(t.id AS CHAR) as id,
                t.name,
                t.position,
                t.status,
                t.user_id,
                u.email,
                u.phone,
                u.first_name,
                u.last_name
            FROM technicians t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.name ASC
        `;

        const [rows] = await pool.execute(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching technicians:', error);
        return NextResponse.json(
            { error: 'Failed to fetch technicians' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    let connection;
    try {
        const body = await req.json();
        const { userId, name, position } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        const userIdBigInt = BigInt(userId);

        // Check if user exists and is not already a technician
        const [existingTech] = await connection.execute(
            'SELECT id, status FROM technicians WHERE user_id = ?',
            [userIdBigInt]
        );

        if ((existingTech as any[]).length > 0) {
            // If technician exists but is inactive, reactivate them
            if ((existingTech as any[])[0].status === 'inactive') {
                await connection.execute(
                    'UPDATE technicians SET status = ?, name = ?, position = ? WHERE user_id = ?',
                    ['active', name, position, userIdBigInt]
                );
                await connection.execute(
                    'UPDATE users SET role = ? WHERE id = ?',
                    ['technician', userIdBigInt]
                );
                await connection.commit();
                return NextResponse.json({ success: true });
            }
            return NextResponse.json(
                { error: 'User is already a technician' },
                { status: 400 }
            );
        }

        // Create new technician
        const [result] = await connection.execute(
            `INSERT INTO technicians (user_id, name, position, status)
             VALUES (?, ?, ?, 'active')`,
            [userIdBigInt, name, position]
        );

        await connection.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            ['technician', userIdBigInt]
        );

        await connection.commit();
        return NextResponse.json({
            success: true,
            id: (result as any).insertId
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating technician:', error);
        return NextResponse.json(
            { error: 'Failed to create technician' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}