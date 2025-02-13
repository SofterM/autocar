// app/api/parts/report/download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import pool from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';
import { formatDate } from '@/utils/format';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
    let connection;

    try {
        connection = await pool.getConnection();

        // เปลี่ยนการ query เพื่อดึงข้อมูลทั้งหมดโดยไม่กรอง status
        const [partsRows] = await connection.execute<RowDataPacket[]>(`
            SELECT
                p.*,
                c.name as category_name
            FROM parts p
            LEFT JOIN parts_categories c ON p.category_id = c.id
            ORDER BY c.name, p.name
        `);

        // Fetch company info
        const [companyRows] = await connection.execute<RowDataPacket[]>('SELECT * FROM contact_channels LIMIT 1');
        
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

        // Set styles
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.1);

        // Header
        doc.roundedRect(15, 15, 180, 30, 2, 2);
        doc.setFontSize(18);
        doc.text(companyInfo.company_name || 'บริษัท', 105, 28, { align: 'center' });
        doc.setFontSize(14);
        doc.text('รายงานอะไหล่คงเหลือ', 105, 38, { align: 'center' });

        // Report Info
        doc.roundedRect(15, 50, 180, 20, 2, 2);
        doc.setFontSize(10);
        doc.text(`วันที่พิมพ์: ${formatDate(new Date().toISOString())}`, 25, 60);
        
        // แยกจำนวนตามสถานะ
        const activeItems = partsRows.filter(p => p.status === 'active').length;
        const inactiveItems = partsRows.filter(p => p.status === 'inactive').length;
        doc.text(`จำนวนรายการทั้งหมด: ${partsRows.length} รายการ (ใช้งาน ${activeItems} รายการ, ไม่ใช้งาน ${inactiveItems} รายการ)`, 120, 60);

        // Calculate totals
        let totalValue = 0;
        let totalItems = 0;
        partsRows.forEach((part: any) => {
            const price = Number(part.price) || 0;
            const quantity = Number(part.stock_quantity) || 0;
            totalValue += quantity * price;
            totalItems += quantity;
        });

        // Table header
        const startY = 80;
        const tableWidth = 180;
        const colWidths = [50, 25, 25, 20, 25, 20, 15];  // Total: 180
        const colPositions = colWidths.reduce((acc, width, i) =>
            [...acc, (acc[i] || 15) + width],
            [15]
        );

        // Header background
        doc.setFillColor(245, 245, 245);
        doc.rect(15, startY, tableWidth, 8, 'F');

        // Header content
        doc.setFontSize(10);
        const headers = ['รายการ', 'ราคาทุน', 'ราคาขาย', 'คงเหลือ', 'มูลค่าขาย', 'สถานะ', 'ใช้งาน'];
        
        headers.forEach((header, i) => {
            if (i === 0) {
                doc.text(header, colPositions[i] + 3, startY + 6);
            } else {
                const x = colPositions[i] + (colWidths[i] / 2);
                doc.text(header, x, startY + 6, { align: 'center' });
            }
        });

        // Draw table borders
        doc.roundedRect(15, startY, tableWidth, 8 + (partsRows.length * 8), 2, 2);
        colPositions.forEach(x => {
            doc.line(x, startY, x, startY + 8 + (partsRows.length * 8));
        });

        // Table rows
        let y = startY + 8;
        let currentCategory = '';

        partsRows.forEach((part: any) => {
            // Add category header if new category
            if (currentCategory !== part.category_name) {
                currentCategory = part.category_name || 'ไม่มีหมวดหมู่';
                doc.setFillColor(250, 250, 250);
                doc.rect(15, y, tableWidth, 8, 'F');
                doc.setFontSize(10);
                doc.text(`หมวดหมู่: ${currentCategory}`, 20, y + 6);
                y += 8;
                doc.line(15, y, 195, y);
            }

            // Draw row line
            doc.line(15, y, 195, y);

            // Convert values to numbers and handle null/undefined
            const cost = Number(part.cost) || 0;
            const price = Number(part.price) || 0;
            const quantity = Number(part.stock_quantity) || 0;
            const minQuantity = Number(part.minimum_quantity) || 0;
            const stockValue = quantity * price;
            const stockStatus = quantity <= minQuantity ? 'ใกล้หมด' : 'ปกติ';
            const isActive = part.status === 'active';

            // Row data
            doc.setFontSize(10);
            doc.text(`${part.name || ''}`, colPositions[0] + 3, y + 6);
            doc.text(cost.toFixed(2), colPositions[1] + (colWidths[1] / 2), y + 6, { align: 'center' });
            doc.text(price.toFixed(2), colPositions[2] + (colWidths[2] / 2), y + 6, { align: 'center' });
            doc.text(quantity.toString(), colPositions[3] + (colWidths[3] / 2), y + 6, { align: 'center' });
            doc.text(stockValue.toFixed(2), colPositions[4] + (colWidths[4] / 2), y + 6, { align: 'center' });
            
            // Stock status with color
            const statusX = colPositions[5] + (colWidths[5] / 2);
            if (stockStatus === 'ใกล้หมด') {
                doc.setTextColor(220, 38, 38);  // Red color
                doc.text(stockStatus, statusX, y + 6, { align: 'center' });
                doc.setTextColor(0, 0, 0);  // Reset color
            } else {
                doc.text(stockStatus, statusX, y + 6, { align: 'center' });
            }

            // Active status with color
            const activeX = colPositions[6] + (colWidths[6] / 2);
            if (!isActive) {
                doc.setTextColor(220, 38, 38);  // Red color
                doc.text('ไม่ใช้', activeX, y + 6, { align: 'center' });
                doc.setTextColor(0, 0, 0);  // Reset color
            } else {
                doc.setTextColor(34, 197, 94);  // Green color
                doc.text('ใช้', activeX, y + 6, { align: 'center' });
                doc.setTextColor(0, 0, 0);  // Reset color
            }

            y += 8;
        });

        // Summary box
        doc.roundedRect(120, y + 5, 75, 45, 2, 2);
        doc.setFontSize(10);
        doc.text('สรุปรวม:', 125, y + 15);
        doc.text(`จำนวนคงเหลือ: ${totalItems.toLocaleString()} ชิ้น`, 125, y + 23);
        doc.text(`สถานะใช้งาน: ${activeItems} รายการ`, 125, y + 31);
        doc.text(`สถานะไม่ใช้งาน: ${inactiveItems} รายการ`, 125, y + 39);
        doc.text('มูลค่าขายรวม:', 125, y + 47);
        doc.text(`${totalValue.toFixed(2)} บาท`, 190, y + 47, { align: 'right' });

        const pdfOutput = doc.output('arraybuffer');

        return new NextResponse(pdfOutput, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=inventory-report.pdf'
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return new NextResponse('Error generating PDF', { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
