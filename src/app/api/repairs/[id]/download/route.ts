// app/api/repairs/[id]/download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import pool from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';
import { formatDate, formatPhoneNumber } from '@/utils/format';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    let connection;

    try {
        const params = await context.params;
        const id = params.id;
        
        connection = await pool.getConnection();

        // Fetch repair details with vehicle and customer info
        const [repairRows] = await connection.execute<RowDataPacket[]>(`
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
                DATE_FORMAT(r.start_date, '%Y-%m-%d') as start_date,
                DATE_FORMAT(
                    CASE
                        WHEN r.status = 'completed' THEN r.updated_at
                        ELSE CURRENT_DATE()
                    END,
                    '%Y-%m-%d'
                ) as completed_date
            FROM repairs r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN technicians t ON r.technician_id = t.id
            WHERE r.id = ?
        `, [id]);

        if (repairRows.length === 0) {
            return new NextResponse('Repair not found', { status: 404 });
        }

        const repair = repairRows[0];

        // Fetch parts for this repair
        const [partsRows] = await connection.execute<RowDataPacket[]>(`
            SELECT
                p.name,
                rp.quantity,
                rp.price_per_unit,
                rp.total_price
            FROM repair_parts rp
            JOIN parts p ON rp.part_id = p.id
            WHERE rp.repair_id = ?
            ORDER BY rp.created_at ASC
        `, [id]);

        // Fetch company info
        const [companyRows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM contact_channels LIMIT 1'
        );

        if (companyRows.length === 0) {
            return new NextResponse('Company information not found', { status: 404 });
        }

        const companyInfo = companyRows[0];

        const fontPath = path.join(process.cwd(), 'public/fonts/THSarabunNew.ttf');
        const fontData = fs.readFileSync(fontPath);

        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4'
        });

        // Add Thai font
        const fontBase64 = fontData.toString('base64');
        doc.addFileToVFS('THSarabunNew.ttf', fontBase64);
        doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
        doc.setFont('THSarabunNew');

        // Company Header with border box
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.1);
        doc.roundedRect(15, 15, 180, 30, 2, 2);

        doc.setFontSize(18);
        doc.text(companyInfo.company_name, 105, 28, { align: 'center' });
        doc.setFontSize(14);
        doc.text('ใบเสร็จรับเงิน / ใบกำกับภาษี', 105, 38, { align: 'center' });

        // Bill Info Box
        doc.roundedRect(15, 50, 180, 25, 2, 2);
        doc.setFontSize(12);
        doc.text(`เลขที่: R${repair.id.toString().padStart(6, '0')}`, 25, 62);
        doc.text(`วันที่ออกใบเสร็จ: ${formatDate(repair.completed_date)}`, 120, 62);
        doc.text(`เลขประจำตัวผู้เสียภาษี: ${companyInfo.tax_id}`, 25, 70);
        doc.text(`ที่อยู่: ${companyInfo.address}`, 120, 70);

        // Customer and Car Info Box
        doc.roundedRect(15, 80, 180, 50, 2, 2);

        // Left column - Customer Info
        doc.setFontSize(12);
        doc.text('ข้อมูลลูกค้า', 25, 90);
        doc.setFontSize(10);
        doc.text(`ชื่อ: ${repair.customer_name}`, 25, 98);
        doc.text(`โทร: ${formatPhoneNumber(repair.customer_phone)}`, 25, 105);

        // Right column - Car Info
        doc.setFontSize(12);
        doc.text('ข้อมูลรถ', 120, 90);
        doc.setFontSize(10);
        doc.text(`ยี่ห้อ/รุ่น: ${repair.brand} ${repair.model}`, 120, 98);
        doc.text(`ทะเบียน: ${repair.license_plate}`, 120, 105);
        doc.text(`เลขไมล์: ${repair.mileage?.toLocaleString()} กม.`, 120, 112);

        // Parts Table
        doc.setFontSize(12);
        doc.text('รายการสินค้าและบริการ', 25, 140);

        // Table header
        const startY = 145;
        const tableWidth = 180;

        const colWidths = [90, 25, 30, 35];
        const colPositions = [
            15,
            15 + colWidths[0],
            15 + colWidths[0] + colWidths[1],
            15 + colWidths[0] + colWidths[1] + colWidths[2],
            195
        ];

        // Header background
        doc.setFillColor(245, 245, 245);
        doc.rect(15, startY, tableWidth, 8, 'F');

        // Table border
        doc.roundedRect(15, startY, tableWidth, 8 + (partsRows.length * 8), 2, 2);

        const headers = ['รายการ', 'จำนวน', 'ราคา/หน่วย', 'จำนวนเงิน'];

        // Vertical lines
        colPositions.forEach(x => {
            doc.line(x, startY, x, startY + 8 + (partsRows.length * 8));
        });

        // Write headers
        doc.setFontSize(11);
        doc.text(headers[0], colPositions[0] + 5, startY + 6);
        headers.slice(1).forEach((header, i) => {
            const x = colPositions[i + 1] + (colWidths[i + 1]/2);
            doc.text(header, x, startY + 6, { align: 'center' });
        });

        // Table rows
        let y = startY + 8;
        let partsTotal = 0;
        doc.setFontSize(10);

        partsRows.forEach((part: any) => {
            doc.line(15, y, 195, y);
            
            doc.text(part.name, colPositions[0] + 5, y + 5);
            doc.text(part.quantity.toString(), colPositions[1] + (colWidths[1]/2), y + 5, { align: 'center' });
            doc.text(Number(part.price_per_unit).toFixed(2), colPositions[2] + (colWidths[2]/2), y + 5, { align: 'center' });
            doc.text(Number(part.total_price).toFixed(2), colPositions[3] + (colWidths[3]/2), y + 5, { align: 'center' });

            partsTotal += Number(part.total_price);
            y += 8;
        });

        // Service & Cost Summary
        const summaryStartY = y + 10;

        // Left box - Service details
        doc.roundedRect(15, summaryStartY, 100, 40, 2, 2);
        doc.setFontSize(10);
        doc.text('รายละเอียดการซ่อม:', 20, summaryStartY + 8);
        doc.text(`วันที่รับรถ: ${formatDate(repair.start_date)}`, 20, summaryStartY + 16);
        doc.text(`วันที่ซ่อมเสร็จ: ${formatDate(repair.completed_date)}`, 20, summaryStartY + 24);
        if (repair.technician_name) {
            doc.text(`ช่างผู้ดูแล: ${repair.technician_name}`, 20, summaryStartY + 32);
        }

        // Right box - Cost summary
        doc.roundedRect(120, summaryStartY, 75, 40, 2, 2);
        const laborCost = Number(repair.estimated_cost) || 0;
        const grandTotal = partsTotal + laborCost;

        doc.text('รวมค่าอะไหล่:', 125, summaryStartY + 10);
        doc.text(`${partsTotal.toFixed(2)}`, 190, summaryStartY + 10, { align: 'right' });
        
        doc.text('ค่าแรง:', 125, summaryStartY + 22);
        doc.text(`${laborCost.toFixed(2)}`, 190, summaryStartY + 22, { align: 'right' });
        
        doc.setFontSize(12);
        doc.text('รวมทั้งสิ้น:', 125, summaryStartY + 34);
        doc.text(`${grandTotal.toFixed(2)}`, 190, summaryStartY + 34, { align: 'right' });

        const pdfOutput = doc.output('arraybuffer');

        return new NextResponse(pdfOutput, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=repair-bill-${repair.id}.pdf`
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return new NextResponse('Error generating PDF', { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
