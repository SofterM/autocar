// src/app/api/repairs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = await context.params;

        const [rows] = await pool.execute(`
            SELECT 
                r.*,
                v.brand,
                v.model,
                v.license_plate,
                v.color,
                c.id as customer_id,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.id as technician_id,
                t.name as technician_name,
                t.position as technician_position
            FROM repairs r
            JOIN vehicles v ON r.vehicle_id = v.id
            JOIN customers c ON r.customer_id = c.id
            LEFT JOIN technicians t ON r.technician_id = t.id
            WHERE r.id = ?
        `, [id]);

        if ((rows as any[]).length === 0) {
            return NextResponse.json(
                { error: 'Repair not found' },
                { status: 404 }
            );
        }

        // Get repair parts
        const [parts] = await pool.execute(`
            SELECT 
                rp.*,
                p.name as part_name,
                p.code as part_code,
                pc.name as category_name
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            LEFT JOIN parts_categories pc ON p.category_id = pc.id
            WHERE rp.repair_id = ?
            ORDER BY rp.created_at DESC
        `, [id]);

        // Format response
        const repair = (rows as any[])[0];
        const formattedRepair = {
            id: repair.id.toString(),
            status: repair.status,
            brand: repair.brand,
            model: repair.model,
            license_plate: repair.license_plate,
            color: repair.color,
            mileage: repair.mileage,
            start_date: repair.start_date,
            expected_end_date: repair.expected_end_date,
            actual_end_date: repair.actual_end_date,
            description: repair.description,
            estimated_cost: repair.estimated_cost || 0,
            parts_cost: repair.parts_cost || 0,
            labor_cost: repair.labor_cost || 0,
            total_cost: repair.total_cost || 0,
            customer: {
                id: repair.customer_id.toString(),
                name: repair.customer_name,
                email: repair.customer_email,
                phone: repair.customer_phone
            },
            technician: repair.technician_id ? {
                id: repair.technician_id.toString(),
                name: repair.technician_name,
                position: repair.technician_position
            } : null,
            parts: (parts as any[]).map(part => ({
                id: part.id.toString(),
                part_name: part.part_name,
                part_code: part.part_code,
                quantity: part.quantity,
                price_per_unit: part.price_per_unit,
                total_price: part.total_price,
                category_name: part.category_name
            }))
        };

        return NextResponse.json(formattedRepair);

    } catch (error) {
        console.error('Error fetching repair details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repair details' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } }
) {
    let connection;
    try {
        const { id } = await context.params;
        const body = await request.json();
        const {
            status,
            technicianId,
            laborCost,
            description,
            expectedEndDate
        } = body;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Build update query dynamically
        const updates = [];
        const params = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);

            if (status === 'completed') {
                updates.push('actual_end_date = CURRENT_DATE()');
            }
        }

        if (technicianId !== undefined) {
            updates.push('technician_id = ?');
            params.push(technicianId || null);
        }

        if (laborCost !== undefined) {
            updates.push('labor_cost = ?');
            params.push(laborCost);
            updates.push('total_cost = (COALESCE(parts_cost, 0) + ?)');
            params.push(laborCost);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (expectedEndDate !== undefined) {
            updates.push('expected_end_date = ?');
            params.push(expectedEndDate || null);
        }

        if (updates.length > 0) {
            const query = `
                UPDATE repairs 
                SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            params.push(id);
            await connection.execute(query, params);
        }

        // Fetch updated repair
        const [rows] = await connection.execute(`
            SELECT 
                r.*,
                v.brand,
                v.model,
                v.license_plate,
                v.color,
                c.id as customer_id,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.id as technician_id,
                t.name as technician_name,
                t.position as technician_position
            FROM repairs r
            JOIN vehicles v ON r.vehicle_id = v.id
            JOIN customers c ON r.customer_id = c.id
            LEFT JOIN technicians t ON r.technician_id = t.id
            WHERE r.id = ?
        `, [id]);

        // Get repair parts
        const [parts] = await connection.execute(`
            SELECT 
                rp.*,
                p.name as part_name,
                p.code as part_code,
                pc.name as category_name
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            LEFT JOIN parts_categories pc ON p.category_id = pc.id
            WHERE rp.repair_id = ?
            ORDER BY rp.created_at DESC
        `, [id]);

        await connection.commit();

        // Format response
        const repair = (rows as any[])[0];
        const formattedRepair = {
            id: repair.id.toString(),
            status: repair.status,
            brand: repair.brand,
            model: repair.model,
            license_plate: repair.license_plate,
            color: repair.color,
            mileage: repair.mileage,
            start_date: repair.start_date,
            expected_end_date: repair.expected_end_date,
            actual_end_date: repair.actual_end_date,
            description: repair.description,
            estimated_cost: repair.estimated_cost || 0,
            parts_cost: repair.parts_cost || 0,
            labor_cost: repair.labor_cost || 0,
            total_cost: repair.total_cost || 0,
            customer: {
                id: repair.customer_id.toString(),
                name: repair.customer_name,
                email: repair.customer_email,
                phone: repair.customer_phone
            },
            technician: repair.technician_id ? {
                id: repair.technician_id.toString(),
                name: repair.technician_name,
                position: repair.technician_position
            } : null,
            parts: (parts as any[]).map(part => ({
                id: part.id.toString(),
                part_name: part.part_name,
                part_code: part.part_code,
                quantity: part.quantity,
                price_per_unit: part.price_per_unit,
                total_price: part.total_price,
                category_name: part.category_name
            }))
        };

        return NextResponse.json(formattedRepair);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating repair:', error);
        return NextResponse.json(
            { error: 'Failed to update repair' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}
