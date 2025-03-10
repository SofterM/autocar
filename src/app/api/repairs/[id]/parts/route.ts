// D:\Github\autocar\src\app\api\repairs\[id]\parts\route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { formatBigInt, toBigInt } from '@/lib/db-utils';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RepairPart extends RowDataPacket {
    id: bigint;
    repair_id: bigint;
    part_id: number;
    quantity: number;
    price_per_unit: number;
    total_price: number;
    cost_price: number;
    profit_amount: number;
    created_at: Date;
    updated_at: Date;
    part_name: string;
    part_code: string;
    category_name: string;
}

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const params = await Promise.resolve(context.params);
        const bigIntId = toBigInt(params.id);

        const [rows] = await pool.execute<RepairPart[]>(`
            SELECT 
                rp.id,
                rp.repair_id,
                rp.part_id,
                rp.quantity,
                rp.price_per_unit,
                rp.total_price,
                rp.cost_price,
                rp.profit_amount,
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

        const formattedRows = rows.map(row => ({
            ...row,
            id: formatBigInt(row.id),
            repair_id: formatBigInt(row.repair_id),
            part_id: Number(row.part_id),
            price_per_unit: Number(row.price_per_unit),
            total_price: Number(row.total_price),
            cost_price: Number(row.cost_price),
            profit_amount: Number(row.profit_amount)
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
    context: { params: { id: string } }
) {
    let connection;
    try {
        const params = await Promise.resolve(context.params);
        const bigIntId = toBigInt(params.id);
        const body = await request.json();
        const { partId, quantity } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check repair existence
        const [repairs] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM repairs WHERE id = ?',
            [bigIntId]
        );

        if (repairs.length === 0) {
            return NextResponse.json(
                { error: `ไม่พบข้อมูลงานซ่อม ID: ${params.id}` },
                { status: 404 }
            );
        }

        // Check part availability
        const [parts] = await connection.execute<RowDataPacket[]>(
            'SELECT id, name, price, cost, stock_quantity FROM parts WHERE id = ?',
            [partId]
        );

        if (parts.length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลอะไหล่' },
                { status: 404 }
            );
        }

        const part = parts[0];

        if (part.stock_quantity < quantity) {
            return NextResponse.json(
                { error: `ไม่มีอะไหล่เพียงพอ: ${part.name} มีในสต็อก ${part.stock_quantity} ชิ้น` },
                { status: 400 }
            );
        }

        const pricePerUnit = Number(part.price);
        const costPrice = Number(part.cost);
        const totalPrice = pricePerUnit * quantity;
        const profitAmount = (pricePerUnit - costPrice) * quantity;

        // Add repair part
        const [result] = await connection.execute<ResultSetHeader>(
            `INSERT INTO repair_parts (
                repair_id, part_id, quantity, 
                price_per_unit, total_price,
                cost_price, profit_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [bigIntId, partId, quantity, pricePerUnit, totalPrice, costPrice, profitAmount]
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
        const [newRepairPart] = await connection.execute<RepairPart[]>(`
            SELECT 
                rp.id,
                rp.repair_id,
                rp.part_id,
                rp.quantity,
                rp.price_per_unit,
                rp.total_price,
                rp.cost_price,
                rp.profit_amount,
                rp.created_at,
                rp.updated_at,
                p.name as part_name,
                p.code as part_code,
                pc.name as category_name
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            LEFT JOIN parts_categories pc ON p.category_id = pc.id
            WHERE rp.id = ?
        `, [result.insertId]);

        const formattedRepairPart = {
            ...newRepairPart[0],
            id: formatBigInt(newRepairPart[0].id),
            repair_id: formatBigInt(newRepairPart[0].repair_id),
            part_id: Number(newRepairPart[0].part_id),
            price_per_unit: Number(newRepairPart[0].price_per_unit),
            total_price: Number(newRepairPart[0].total_price),
            cost_price: Number(newRepairPart[0].cost_price),
            profit_amount: Number(newRepairPart[0].profit_amount)
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
    context: { params: { id: string } }
) {
    let connection;
    try {
        const params = await Promise.resolve(context.params);
        const bigIntId = toBigInt(params.id);
        const body = await request.json();
        const { repairPartId } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check repair part existence
        const [repairParts] = await connection.execute<RowDataPacket[]>(
            'SELECT part_id, quantity FROM repair_parts WHERE id = ? AND repair_id = ?',
            [toBigInt(repairPartId), bigIntId]
        );

        if (repairParts.length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบรายการอะไหล่ที่ต้องการลบ' },
                { status: 404 }
            );
        }

        const repairPart = repairParts[0];

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