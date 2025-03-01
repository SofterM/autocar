import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const { id } = params;
    const body = await request.json();
    const { name, position, status, salary } = body;

    if (!name || !position || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
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

    const [currentTech] = await connection.execute(
      'SELECT status, user_id FROM technicians WHERE id = ?',
      [id]
    );

    if ((currentTech as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      );
    }
    
    const userId = (currentTech as any[])[0].user_id;
    const prevStatus = (currentTech as any[])[0].status;

    await connection.execute(
      `UPDATE technicians SET name = ?, position = ?, status = ?, salary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, position, status, salary, id]
    );
    
    // หากมีการเปลี่ยนสถานะจาก active เป็น inactive ให้เปลี่ยน role ของผู้ใช้กลับเป็น user
    if (prevStatus === 'active' && status === 'inactive') {
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        ['staff', userId]
      );
    }
    // หากมีการเปลี่ยนสถานะจาก inactive เป็น active ให้เปลี่ยน role ของผู้ใช้เป็น technician
    else if (prevStatus === 'inactive' && status === 'active') {
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        ['technician', userId]
      );
    }

    await connection.commit();
    return NextResponse.json({ message: 'Technician updated successfully', status: status });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating technician:', error);
    return NextResponse.json(
      { error: 'Failed to update technician' },
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

    const [technicians] = await connection.execute(
      'SELECT user_id FROM technicians WHERE id = ?',
      [id]
    );

    if ((technicians as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      );
    }

    const userId = (technicians as any[])[0].user_id;

    // Remove technician assignments from repairs
    await connection.execute(
      'UPDATE repairs SET technician_id = NULL WHERE technician_id = ?',
      [id]
    );

    // Delete the technician record
    await connection.execute(
      'DELETE FROM technicians WHERE id = ?',
      [id]
    );

    // อัพเดทบทบาทของผู้ใช้กลับเป็น user
    await connection.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      ['staff', userId]
    );

    await connection.commit();
    return NextResponse.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error deleting technician:', error);
    return NextResponse.json(
      { error: 'Failed to delete technician' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}