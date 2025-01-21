// src/app/api/repairs/[id]/parts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { formatBigInt, toBigInt } from '@/lib/db-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const bigIntId = toBigInt(id);

        const [rows] = await pool.execute(`
            SELECT 
                rp.id,
                rp.repair_id,
                rp.part_id,
                rp.quantity,
                rp.price_per_unit,
                rp.total_price,
                rp.created_at,
                rp.updated_at,
                p.name as part_name,
                p.code as part_code,
                p.stock_quantity,
                pc.name as category_name
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            LEFT JOIN parts_categories pc ON p.category_id = pc.id
            WHERE rp.repair_id = ?
            ORDER BY rp.created_at DESC
        `, [bigIntId]);

        const formattedRows = (rows as any[]).map(row => ({
            ...row,
            id: formatBigInt(row.id),
            repair_id: formatBigInt(row.repair_id),
            part_id: Number(row.part_id),
            price_per_unit: Number(row.price_per_unit),
            total_price: Number(row.total_price)
        }));

        return NextResponse.json(formattedRows);

    } catch (error) {
        console.error('Error fetching repair parts:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = await params;
        const bigIntId = toBigInt(id);
        const body = await request.json();
        const { partId, quantity } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check repair existence
        const [repairs] = await connection.execute(
            'SELECT id FROM repairs WHERE id = ?',
            [bigIntId]
        );

        if ((repairs as any[]).length === 0) {
            return NextResponse.json(
                { error: `ไม่พบข้อมูลงานซ่อม ID: ${id}` },
                { status: 404 }
            );
        }

        // Check part availability
        const [parts] = await connection.execute(
            'SELECT id, name, price, stock_quantity FROM parts WHERE id = ?',
            [partId]
        );

        if ((parts as any[]).length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลอะไหล่' },
                { status: 404 }
            );
        }

        const part = (parts as any[])[0];

        if (part.stock_quantity < quantity) {
            return NextResponse.json(
                { error: `ไม่มีอะไหล่เพียงพอ: ${part.name} มีในสต็อก ${part.stock_quantity} ชิ้น` },
                { status: 400 }
            );
        }

        const pricePerUnit = Number(part.price);
        const totalPrice = pricePerUnit * quantity;

        // Add repair part
        const [result] = await connection.execute(
            `INSERT INTO repair_parts (
                repair_id, part_id, quantity, 
                price_per_unit, total_price
            ) VALUES (?, ?, ?, ?, ?)`,
            [bigIntId, partId, quantity, pricePerUnit, totalPrice]
        );

        // Update stock
        await connection.execute(
            'UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [quantity, partId]
        );

        // Update repair costs
        await connection.execute(`
            UPDATE repairs r
            SET 
                parts_cost = (
                    SELECT COALESCE(SUM(total_price), 0)
                    FROM repair_parts
                    WHERE repair_id = ?
                ),
                total_cost = COALESCE(labor_cost, 0) + (
                    SELECT COALESCE(SUM(total_price), 0)
                    FROM repair_parts
                    WHERE repair_id = ?
                )
            WHERE r.id = ?
        `, [bigIntId, bigIntId, bigIntId]);

        await connection.commit();

        // Get updated repair part
        const [newRepairPart] = await connection.execute(`
            SELECT 
                rp.id,
                rp.repair_id,
                rp.part_id,
                rp.quantity,
                rp.price_per_unit,
                rp.total_price,
                rp.created_at,
                rp.updated_at,
                p.name as part_name,
                p.code as part_code,
                pc.name as category_name
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            LEFT JOIN parts_categories pc ON p.category_id = pc.id
            WHERE rp.id = ?
        `, [(result as any).insertId]);

        const formattedRepairPart = {
            ...(newRepairPart as any[])[0],
            id: formatBigInt((newRepairPart as any[])[0].id),
            repair_id: formatBigInt((newRepairPart as any[])[0].repair_id),
            part_id: Number((newRepairPart as any[])[0].part_id),
            price_per_unit: Number((newRepairPart as any[])[0].price_per_unit),
            total_price: Number((newRepairPart as any[])[0].total_price)
        };

        return NextResponse.json(formattedRepairPart);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error adding repair part:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการเพิ่มอะไหล่' },
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
        const bigIntId = toBigInt(id);
        const body = await request.json();
        const { repairPartId } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check repair part existence
        const [repairParts] = await connection.execute(
            'SELECT part_id, quantity FROM repair_parts WHERE id = ? AND repair_id = ?',
            [toBigInt(repairPartId), bigIntId]
        );

        if ((repairParts as any[]).length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบรายการอะไหล่ที่ต้องการลบ' },
                { status: 404 }
            );
        }

        const repairPart = (repairParts as any[])[0];

        // Return parts to stock
        await connection.execute(
            'UPDATE parts SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [repairPart.quantity, repairPart.part_id]
        );

        // Delete repair part
        await connection.execute(
            'DELETE FROM repair_parts WHERE id = ?',
            [toBigInt(repairPartId)]
        );

        // Update repair costs
        await connection.execute(`
            UPDATE repairs r
            SET 
                parts_cost = (
                    SELECT COALESCE(SUM(total_price), 0)
                    FROM repair_parts
                    WHERE repair_id = ?
                ),
                total_cost = COALESCE(labor_cost, 0) + (
                    SELECT COALESCE(SUM(total_price), 0)
                    FROM repair_parts
                    WHERE repair_id = ?
                )
            WHERE r.id = ?
        `, [bigIntId, bigIntId, bigIntId]);

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: 'ลบรายการอะไหล่เรียบร้อยแล้ว'
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error removing repair part:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการลบอะไหล่' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}