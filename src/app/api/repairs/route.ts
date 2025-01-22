import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { PoolConnection } from 'mysql2/promise';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let query = `
            SELECT 
                r.*,
                v.brand,
                v.model,
                v.license_plate,
                v.color,
                v.mileage,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.name as technician_name,
                t.position as technician_position,
                r.category,
                r.estimated_cost,
                r.final_cost,
                r.parts_cost,
                r.labor_cost,
                r.total_cost
            FROM repairs r
            JOIN vehicles v ON r.vehicle_id = v.id
            JOIN customers c ON r.customer_id = c.id
            LEFT JOIN technicians t ON r.technician_id = t.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status && status !== 'all') {
            query += ' AND r.status = ?';
            params.push(status);
        }

        if (search) {
            query += ` AND (
                v.license_plate LIKE ? OR
                c.name LIKE ? OR
                c.phone LIKE ? OR
                v.brand LIKE ? OR
                v.model LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY r.created_at DESC';

        const [rows] = await pool.execute(query, params);

        const formattedRepairs = (rows as any[]).map(row => ({
            id: row.id.toString(),
            brand: row.brand,
            model: row.model,
            license_plate: row.license_plate,
            color: row.color,
            mileage: row.mileage,
            start_date: row.start_date,
            expected_end_date: row.expected_end_date,
            actual_end_date: row.actual_end_date,
            status: row.status,
            category: row.category || 'engine_repair',
            estimated_cost: Number(row.estimated_cost) || 0,
            final_cost: Number(row.final_cost) || 0,
            parts_cost: Number(row.parts_cost) || 0,
            labor_cost: Number(row.labor_cost) || 0,
            total_cost: Number(row.total_cost) || 0,
            description: row.description,
            customer: {
                name: row.customer_name,
                phone: row.customer_phone,
                email: row.customer_email
            },
            technician: row.technician_id ? {
                name: row.technician_name,
                position: row.technician_position
            } : null
        }));

        return NextResponse.json(formattedRepairs);

    } catch (error) {
        console.error('Error in GET /api/repairs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repairs' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    let connection: PoolConnection | null = null;
    try {
        const body = await request.json();
        const {
            brand,
            model,
            licensePlate,
            color,
            mileage,
            startDate,
            expectedEndDate,
            description,
            customerName,
            customerPhone,
            customerEmail,
            technicianId,
            estimatedCost,
            category = 'engine_repair'
        } = body;

        if (!brand || !model || !licensePlate || !mileage || !customerName || !customerPhone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [customerResult] = await connection.execute(
            `INSERT INTO customers (name, phone, email) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             name = VALUES(name),
             phone = VALUES(phone),
             email = VALUES(email)`,
            [customerName, customerPhone, customerEmail || null]
        );
        
        let customerId;
        if ((customerResult as any).insertId === 0) {
            const [existingCustomer] = await connection.execute(
                'SELECT id FROM customers WHERE phone = ?',
                [customerPhone]
            );
            customerId = (existingCustomer as any[])[0].id;
        } else {
            customerId = (customerResult as any).insertId;
        }

        const [vehicleResult] = await connection.execute(
            `INSERT INTO vehicles (customer_id, brand, model, license_plate, color, mileage)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             customer_id = VALUES(customer_id),
             brand = VALUES(brand),
             model = VALUES(model),
             color = VALUES(color),
             mileage = VALUES(mileage)`,
            [customerId, brand, model, licensePlate, color, mileage]
        );

        let vehicleId;
        if ((vehicleResult as any).insertId === 0) {
            const [existingVehicle] = await connection.execute(
                'SELECT id FROM vehicles WHERE license_plate = ?',
                [licensePlate]
            );
            vehicleId = (existingVehicle as any[])[0].id;
        } else {
            vehicleId = (vehicleResult as any).insertId;
        }

        const [repairResult] = await connection.execute(
            `INSERT INTO repairs (
                vehicle_id,
                customer_id,
                technician_id,
                status,
                category,
                start_date,
                expected_end_date,
                description,
                estimated_cost,
                mileage,
                final_cost,
                parts_cost,
                labor_cost,
                total_cost
            ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, 0, 0, 0, 0)`,
            [
                vehicleId,
                customerId,
                technicianId || null,
                category,
                startDate || new Date(),
                expectedEndDate || null,
                description || null,
                estimatedCost || 0,
                mileage
            ]
        );
        const repairId = (repairResult as any).insertId;

        await connection.commit();

        const [rows] = await connection.execute(`
            SELECT 
                r.*,
                v.brand,
                v.model,
                v.license_plate,
                v.color,
                v.mileage,
                c.name as customer_name,
                c.phone as customer_phone,
                c.email as customer_email,
                t.name as technician_name,
                t.position as technician_position
            FROM repairs r
            JOIN vehicles v ON r.vehicle_id = v.id
            JOIN customers c ON r.customer_id = c.id
            LEFT JOIN technicians t ON r.technician_id = t.id
            WHERE r.id = ?
        `, [repairId]);

        const repair = (rows as any[])[0];
        const formattedRepair = {
            id: repair.id.toString(),
            brand: repair.brand,
            model: repair.model,
            license_plate: repair.license_plate,
            color: repair.color,
            mileage: repair.mileage,
            start_date: repair.start_date,
            expected_end_date: repair.expected_end_date,
            status: repair.status,
            category: repair.category || 'engine_repair',
            description: repair.description,
            estimated_cost: Number(repair.estimated_cost) || 0,
            final_cost: Number(repair.final_cost) || 0,
            parts_cost: Number(repair.parts_cost) || 0,
            labor_cost: Number(repair.labor_cost) || 0,
            total_cost: Number(repair.total_cost) || 0,
            customer: {
                name: repair.customer_name,
                phone: repair.customer_phone,
                email: repair.customer_email
            },
            technician: repair.technician_id ? {
                name: repair.technician_name,
                position: repair.technician_position
            } : null
        };

        return NextResponse.json(formattedRepair);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating repair:', error);
        return NextResponse.json(
            { error: 'Failed to create repair' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}