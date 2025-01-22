// D:\Github\autocar\src\app\api\repairs\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { formatBigInt, toBigInt } from '@/lib/db-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = await params;
        const bigIntId = toBigInt(id);
        
        connection = await pool.getConnection();

        const [repairs] = await connection.execute(`
            SELECT 
                r.id,
                r.vehicle_id,
                r.customer_id,
                r.technician_id,
                r.mileage,
                r.start_date,
                r.expected_end_date,
                r.actual_end_date,
                r.description,
                r.status,
                r.category,
                r.estimated_cost,
                r.final_cost,
                r.parts_cost,
                r.labor_cost,
                r.total_cost,
                r.created_at,
                r.updated_at,
                v.brand,
                v.model,
                v.license_plate,
                v.color,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.name as technician_name,
                t.position as technician_position
            FROM repairs r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN technicians t ON r.technician_id = t.id
            WHERE r.id = ?
        `, [bigIntId]);

        if ((repairs as any[]).length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลงานซ่อม' },
                { status: 404 }
            );
        }

        const repair = (repairs as any[])[0];

        const formattedRepair = {
            ...repair,
            id: formatBigInt(repair.id),
            vehicle_id: formatBigInt(repair.vehicle_id),
            customer_id: formatBigInt(repair.customer_id),
            technician_id: formatBigInt(repair.technician_id),
            category: repair.category || 'others',
            mileage: Number(repair.mileage),
            estimated_cost: Number(repair.estimated_cost),
            final_cost: repair.final_cost ? Number(repair.final_cost) : null,
            parts_cost: Number(repair.parts_cost),
            labor_cost: Number(repair.labor_cost),
            total_cost: Number(repair.total_cost)
        };

        return NextResponse.json(formattedRepair);

    } catch (error) {
        console.error('Error fetching repair details:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = await params;
        const bigIntId = toBigInt(id);
        const body = await request.json();
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [repairs] = await connection.execute(
            'SELECT * FROM repairs WHERE id = ?',
            [bigIntId]
        );

        if ((repairs as any[]).length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลงานซ่อม' },
                { status: 404 }
            );
        }

        const updateFields = [];
        const updateValues = [];

        if (body.technician_id !== undefined) {
            updateFields.push('technician_id = ?');
            updateValues.push(toBigInt(body.technician_id));
        }
        if (body.mileage !== undefined) {
            updateFields.push('mileage = ?');
            updateValues.push(body.mileage);
        }
        if (body.start_date !== undefined) {
            updateFields.push('start_date = ?');
            updateValues.push(body.start_date);
        }
        if (body.expected_end_date !== undefined) {
            updateFields.push('expected_end_date = ?');
            updateValues.push(body.expected_end_date);
        }
        if (body.actual_end_date !== undefined) {
            updateFields.push('actual_end_date = ?');
            updateValues.push(body.actual_end_date);
        }
        if (body.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(body.description);
        }
        if (body.status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(body.status);
        }
        if (body.category !== undefined) {
            updateFields.push('category = ?');
            updateValues.push(body.category);
        }
        if (body.estimated_cost !== undefined) {
            updateFields.push('estimated_cost = ?');
            updateValues.push(body.estimated_cost);
        }
        if (body.final_cost !== undefined) {
            updateFields.push('final_cost = ?');
            updateValues.push(body.final_cost);
        }
        if (body.labor_cost !== undefined) {
            updateFields.push('labor_cost = ?');
            updateValues.push(body.labor_cost);
            updateFields.push('total_cost = ? + parts_cost');
            updateValues.push(body.labor_cost);
        }

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: 'ไม่มีข้อมูลที่ต้องการอัปเดต' },
                { status: 400 }
            );
        }

        const updateQuery = `
            UPDATE repairs 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;
        await connection.execute(updateQuery, [...updateValues, bigIntId]);

        await connection.commit();

        const [updatedRepairs] = await connection.execute(`
            SELECT 
                r.*,
                v.brand,
                v.model,
                v.license_plate,
                v.color,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.name as technician_name,
                t.position as technician_position
            FROM repairs r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN technicians t ON r.technician_id = t.id
            WHERE r.id = ?
        `, [bigIntId]);

        const updatedRepair = (updatedRepairs as any[])[0];
        const formattedRepair = {
            ...updatedRepair,
            id: formatBigInt(updatedRepair.id),
            vehicle_id: formatBigInt(updatedRepair.vehicle_id),
            customer_id: formatBigInt(updatedRepair.customer_id),
            technician_id: formatBigInt(updatedRepair.technician_id),
            category: updatedRepair.category || 'others',
            mileage: Number(updatedRepair.mileage),
            estimated_cost: Number(updatedRepair.estimated_cost),
            final_cost: updatedRepair.final_cost ? Number(updatedRepair.final_cost) : null,
            parts_cost: Number(updatedRepair.parts_cost),
            labor_cost: Number(updatedRepair.labor_cost),
            total_cost: Number(updatedRepair.total_cost)
        };

        return NextResponse.json(formattedRepair);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating repair:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
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
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check if repair exists
        const [repairs] = await connection.execute(
            'SELECT id FROM repairs WHERE id = ?',
            [bigIntId]
        );

        if ((repairs as any[]).length === 0) {
            return NextResponse.json(
                { error: 'ไม่พบข้อมูลงานซ่อม' },
                { status: 404 }
            );
        }

        // 1. First, get all repair parts for this repair
        const [repairParts] = await connection.execute(
            'SELECT id, part_id, quantity FROM repair_parts WHERE repair_id = ?',
            [bigIntId]
        );

        // 2. Return parts to inventory
        for (const part of repairParts as any[]) {
            await connection.execute(
                'UPDATE parts SET stock_quantity = stock_quantity + ? WHERE id = ?',
                [part.quantity, part.part_id]
            );
        }

        // 3. Delete repair parts
        if ((repairParts as any[]).length > 0) {
            await connection.execute(
                'DELETE FROM repair_parts WHERE repair_id = ?',
                [bigIntId]
            );
        }

        // 4. Finally delete the repair
        await connection.execute(
            'DELETE FROM repairs WHERE id = ?',
            [bigIntId]
        );

        await connection.commit();

        return NextResponse.json(
            { message: 'ลบข้อมูลงานซ่อมสำเร็จ' },
            { status: 200 }
        );

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting repair:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}