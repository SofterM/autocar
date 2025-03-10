import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import pool from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
    let connection;
    try {
        connection = await pool.getConnection();

        // Fetch company details
        const [rows] = await connection.execute('SELECT * FROM contact_channels LIMIT 1') as any;
        const companyInfo = rows[0] || {
            company_name: '',
            tax_id: '',
            address: '',
            email: '',
            technician_phone: '',
            manager_phone: '',
        };

        // Fetch financial data
        const [results] = await connection.execute(`
            SELECT 
                DATE_FORMAT(r.start_date, '%Y-%m') as month,
                SUM(DISTINCT r.final_cost) as revenue,
                SUM(DISTINCT r.parts_cost) as expenses,
                SUM(rp.profit_amount) as additional_profit
            FROM repairs r
            LEFT JOIN repair_parts rp ON r.id = rp.repair_id
            WHERE r.final_cost IS NOT NULL
            GROUP BY DATE_FORMAT(r.start_date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6;
        `);

        const fontPath = path.join(process.cwd(), 'public/fonts/THSarabunNew.ttf');
        const fontData = fs.readFileSync(fontPath);

        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4'
        });

        const fontBase64 = fontData.toString('base64');
        doc.addFileToVFS('THSarabunNew.ttf', fontBase64);
        doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
        doc.setFont('THSarabunNew');

        // Company Header
        doc.setFontSize(16);
        doc.text(companyInfo.company_name, 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(companyInfo.address, 105, 28, { align: 'center' });
        doc.text(`เลขประจำตัวผู้เสียภาษี: ${companyInfo.tax_id}`, 105, 34, { align: 'center' });
        doc.text(`โทร: ${companyInfo.technician_phone} อีเมล: ${companyInfo.email}`, 105, 40, { align: 'center' });
        if (companyInfo.manager_phone) {
            doc.text(`โทรผู้จัดการ: ${companyInfo.manager_phone}`, 105, 46, { align: 'center' });
        }

        // Report Title
        doc.setFontSize(14);
        doc.text('รายงานสรุปผลทางการเงิน', 105, 56, { align: 'center' });
        doc.text('ประจำเดือนล่าสุด 6 เดือน', 105, 64, { align: 'center' });

        // Table Setup
        doc.setFontSize(12);
        const headers = ['เดือน', 'รายได้', 'ค่าใช้จ่าย', 'กำไรสุทธิ'];
        const columnWidths = [40, 40, 40, 40];
        const startX = 20;
        let y = 76;

        // Draw Table Headers
        headers.forEach((header, i) => {
            doc.setFillColor(220, 220, 220);
            doc.rect(startX + (i * columnWidths[i]), y, columnWidths[i], 10, 'F');
            doc.text(header, startX + (i * columnWidths[i]) + 20, y + 7, { align: 'center' });
        });

        // Table Data Rows
        y += 10;
        (results as any[]).forEach(row => {
            const month = new Date(row.month + '-01').toLocaleDateString('th-TH', { 
                month: 'short', 
                year: 'numeric' 
            });
            const revenue = Number(row.revenue).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const expenses = Number(row.expenses).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const profit = (
                Number(row.revenue) - 
                Number(row.expenses) + 
                Number(row.additional_profit)
            ).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            doc.setFillColor(240, 240, 240);
            doc.rect(startX, y, 160, 10, 'F');

            doc.text(month, startX + 20, y + 7, { align: 'center' });
            doc.text(revenue, startX + 60, y + 7, { align: 'center' });
            doc.text(expenses, startX + 100, y + 7, { align: 'center' });
            doc.text(profit, startX + 140, y + 7, { align: 'center' });

            y += 10;
        });

        // Footer
        doc.setFontSize(10);
        doc.text('หมายเหตุ: รายงานนี้จัดทำขึ้นเพื่อการตรวจสอบภายในเท่านั้น', 105, y + 20, { align: 'center' });
        doc.text(`วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH')}`, 105, y + 26, { align: 'center' });

        const pdfOutput = doc.output('arraybuffer');

        return new NextResponse(pdfOutput, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=financial-report.pdf'
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return new NextResponse('Error generating PDF', { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}