// app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

// Schema for appointment validation
const appointmentSchema = z.object({
  userId: z.number(),
  carInfo: z.object({
    brand: z.string().min(1),
    model: z.string().min(1),
    year: z.string().min(4).max(4),
    licensePlate: z.string().min(1),
  }),
  serviceId: z.number(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  problemDescription: z.string(),
});

// GET appointments with filtering options
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query = `
      SELECT 
        a.*,
        u.first_name, u.last_name, u.phone,
        c.brand, c.model, c.year, c.license_plate,
        s.name as service_name, s.icon as service_icon
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN cars c ON a.car_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      query += ' AND a.user_id = ?';
      params.push(userId);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND DATE(a.appointment_date) = ?';
      params.push(date);
    }

    query += ' ORDER BY a.appointment_date, a.appointment_time';

    const [rows] = await pool.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST new appointment
export async function POST(req: Request) {
  const connection = await pool.getConnection();
  
  try {
    const body = await req.json();
    const validatedData = appointmentSchema.parse(body);

    await connection.beginTransaction();

    // 1. Create car record
    const [carResult] = await connection.execute(
      `INSERT INTO cars (user_id, brand, model, year, license_plate)
       VALUES (?, ?, ?, ?, ?)`,
      [
        validatedData.userId,
        validatedData.carInfo.brand,
        validatedData.carInfo.model,
        validatedData.carInfo.year,
        validatedData.carInfo.licensePlate
      ]
    );

    // 2. Create appointment
    const [appointmentResult] = await connection.execute(
      `INSERT INTO appointments (
        user_id, car_id, service_id, appointment_date,
        appointment_time, problem_description, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        validatedData.userId,
        (carResult as any).insertId,
        validatedData.serviceId,
        validatedData.appointmentDate,
        validatedData.appointmentTime,
        validatedData.problemDescription
      ]
    );

    await connection.commit();

    return NextResponse.json({
      message: 'Appointment created successfully',
      appointmentId: (appointmentResult as any).insertId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// app/api/appointments/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET specific appointment
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        a.*,
        u.first_name, u.last_name, u.phone,
        c.brand, c.model, c.year, c.license_plate,
        s.name as service_name, s.icon as service_icon
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN cars c ON a.car_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?`,
      [params.id]
    );

    if (!(rows as any[])[0]) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PATCH update appointment status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await pool.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, params.id]
    );

    return NextResponse.json({
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// app/api/services/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, icon, description FROM services ORDER BY id'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}