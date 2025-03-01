import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // เพิ่ม searchParams เพื่อให้สามารถเลือกดึงเฉพาะ active ได้
        const query = `
            SELECT
                CAST(t.id AS CHAR) as id,
                t.name,
                t.position,
                t.status,
                t.user_id,
                t.salary,
                u.email,
                u.phone,
                u.first_name,
                u.last_name,
                CASE
                    WHEN t.status = 'active' THEN 'ใช้งาน'
                    ELSE 'ไม่ใช้งาน'
                END as status_th
            FROM technicians t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.status = 'active' DESC, t.name ASC
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
        const { userId, name, position, salary } = body;

        if (!userId || !name || !position) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (salary && (isNaN(salary) || salary < 0)) {
            return NextResponse.json(
                { error: 'Invalid salary value' },
                { status: 400 }
            );
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();
       
        const userIdBigInt = BigInt(userId);

        const [existingTech] = await connection.execute(
            'SELECT id, status FROM technicians WHERE user_id = ?',
            [userIdBigInt]
        );

        if ((existingTech as any[]).length > 0) {
            if ((existingTech as any[])[0].status === 'inactive') {
                await connection.execute(
                    'UPDATE technicians SET status = ?, name = ?, position = ?, salary = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                    ['active', name, position, salary, userIdBigInt]
                );
                
                // อัพเดทบทบาทของผู้ใช้เป็น technician
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

        const [result] = await connection.execute(
            `INSERT INTO technicians (user_id, name, position, status, salary)
             VALUES (?, ?, ?, 'active', ?)`,
            [userIdBigInt, name, position, salary]
        );

        // อัพเดทบทบาทของผู้ใช้เป็น technician
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