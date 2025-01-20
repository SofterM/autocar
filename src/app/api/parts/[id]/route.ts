// src/app/api/repairs/[id]/parts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const repairId = context.params.id;
        
        // แก้ไข query ให้ใช้ repair_parts table
        const [rows] = await pool.execute(`
            SELECT 
                rp.*,
                p.name as part_name,
                p.code as part_code,
                p.stock_quantity,
                pc.name as category_name
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            LEFT JOIN parts_categories pc ON p.category_id = pc.id
            WHERE rp.repair_id = ?
            ORDER BY rp.created_at DESC
        `, [repairId]);

        return NextResponse.json(rows);

    } catch (error) {
        console.error('Error fetching repair parts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repair parts' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    context: { params: { id: string } }
) {
    let connection;
    try {
        const repairId = context.params.id;
        const body = await request.json();
        const { partId, quantity } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. ตรวจสอบข้อมูลอะไหล่
        const [parts] = await connection.execute(
            'SELECT id, name, price, stock_quantity FROM parts WHERE id = ?',
            [partId]
        );

        if ((parts as any[]).length === 0) {
            throw new Error('Part not found');
        }

        const part = (parts as any[])[0];

        // 2. ตรวจสอบจำนวนในสต็อก
        if (part.stock_quantity < quantity) {
            throw new Error(`ไม่มีอะไหล่เพียงพอ: ${part.name} มีในสต็อก ${part.stock_quantity} ชิ้น`);
        }

        // 3. คำนวณราคา
        const pricePerUnit = part.price;
        const totalPrice = pricePerUnit * quantity;

        // 4. เพิ่มรายการอะไหล่
        const [result] = await connection.execute(
            `INSERT INTO repair_parts (
                repair_id, part_id, quantity, 
                price_per_unit, total_price
            ) VALUES (?, ?, ?, ?, ?)`,
            [repairId, partId, quantity, pricePerUnit, totalPrice]
        );

        // 5. อัพเดทจำนวนในสต็อก
        await connection.execute(
            'UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [quantity, partId]
        );

        // 6. คำนวณราคารวมใหม่
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
        `, [repairId, repairId, repairId]);

        await connection.commit();

        // ดึงข้อมูลล่าสุด
        const [newRepairPart] = await pool.execute(`
            SELECT 
                rp.*,
                p.name as part_name,
                p.code as part_code,
                pc.name as category_name
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            LEFT JOIN parts_categories pc ON p.category_id = pc.id
            WHERE rp.id = ?
        `, [(result as any).insertId]);

        return NextResponse.json((newRepairPart as any[])[0]);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error adding repair part:', error);
        
        const message = error instanceof Error ? error.message : 'Failed to add repair part';
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: { id: string } }
) {
    let connection;
    try {
        const repairId = context.params.id;
        const body = await request.json();
        const { repairPartId } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. ดึงข้อมูลรายการอะไหล่ที่จะลบ
        const [repairParts] = await connection.execute(
            'SELECT part_id, quantity FROM repair_parts WHERE id = ? AND repair_id = ?',
            [repairPartId, repairId]
        );

        if ((repairParts as any[]).length === 0) {
            throw new Error('Repair part not found');
        }

        const repairPart = (repairParts as any[])[0];

        // 2. คืนจำนวนอะไหล่เข้าสต็อก
        await connection.execute(
            'UPDATE parts SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [repairPart.quantity, repairPart.part_id]
        );

        // 3. ลบรายการอะไหล่
        await connection.execute(
            'DELETE FROM repair_parts WHERE id = ?',
            [repairPartId]
        );

        // 4. คำนวณราคารวมใหม่
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
        `, [repairId, repairId, repairId]);

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: 'ลบรายการอะไหล่เรียบร้อยแล้ว'
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error removing repair part:', error);
        
        const message = error instanceof Error ? error.message : 'Failed to remove repair part';
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}