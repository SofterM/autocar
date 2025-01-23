import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM contact_channels')
        return NextResponse.json(rows)
    } catch (error) {
        console.error('Error fetching contact channels:', error)
        return NextResponse.json({ message: 'Error fetching contact channels' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { type, value, description, status = 'active' } = await request.json()
        
        if (!type || !value) {
            return NextResponse.json({ message: 'Type and value are required' }, { status: 400 })
        }

        const [result] = await pool.query(
            'INSERT INTO contact_channels (type, value, description, status) VALUES (?, ?, ?, ?)',
            [type, value, description, status]
        )

        return NextResponse.json({ 
            id: (result as any).insertId, 
            type, 
            value, 
            description, 
            status 
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating contact channel:', error)
        return NextResponse.json({ message: 'Error creating contact channel' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        if (!id) {
            return NextResponse.json({ message: 'ID is required' }, { status: 400 })
        }

        const { type, value, description, status } = await request.json()

        await pool.query(
            'UPDATE contact_channels SET type = ?, value = ?, description = ?, status = ? WHERE id = ?',
            [type, value, description, status, id]
        )

        return NextResponse.json({ 
            id, 
            type, 
            value, 
            description, 
            status 
        })
    } catch (error) {
        console.error('Error updating contact channel:', error)
        return NextResponse.json({ message: 'Error updating contact channel' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        if (!id) {
            return NextResponse.json({ message: 'ID is required' }, { status: 400 })
        }

        await pool.query('DELETE FROM contact_channels WHERE id = ?', [id])
        return NextResponse.json({ message: 'Contact channel deleted successfully' })
    } catch (error) {
        console.error('Error deleting contact channel:', error)
        return NextResponse.json({ message: 'Error deleting contact channel' }, { status: 500 })
    }
}