// src/app/api/parts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = params;
        const body = await request.json();

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update part
        const [result] = await connection.execute<ResultSetHeader>(
            `UPDATE parts SET 
                code = ?,
                name = ?,
                category_id = ?,
                description = ?,
                price = ?,
                cost = ?,
                stock_quantity = ?,
                minimum_quantity = ?,
                location = ?,
                brand = ?,
                status = ?
            WHERE id = ?`,
            [
                body.code,
                body.name,
                body.category_id,
                body.description || '',
                body.price,
                body.cost,
                body.stock_quantity,
                body.minimum_quantity,
                body.location || '',
                body.brand || '',
                body.status,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลอะไหล่' },
                { status: 404 }
            );
        }

        // Get updated part data
        const [updatedPart] = await connection.execute<RowDataPacket[]>(
            `SELECT p.*, c.name as category_name 
             FROM parts p 
             LEFT JOIN parts_categories c ON p.category_id = c.id 
             WHERE p.id = ?`,
            [id]
        );

        await connection.commit();
        return NextResponse.json(updatedPart[0]);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating part:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการแก้ไขอะไหล่' },
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
        const { id } = params;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check if part exists
        const [parts] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM parts WHERE id = ?',
            [id]
        );

        if ((parts as any[]).length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลอะไหล่' },
                { status: 404 }
            );
        }

        // Delete part
        await connection.execute(
            'DELETE FROM parts WHERE id = ?',
            [id]
        );

        await connection.commit();
        return NextResponse.json({
            success: true,
            message: 'ลบข้อมูลอะไหล่เรียบร้อยแล้ว'
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting part:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการลบอะไหล่' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}
