# 🚗 ระบบจัดการยานพาหนะ

![ใบอนุญาต](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)

ระบบจัดการยานพาหนะที่ทันสมัย มีประสิทธิภาพ พัฒนาด้วย Next.js, Tailwind CSS และ Node.js ช่วยให้การทำงานของช่างซ่อมรถเป็นไปอย่างราบรื่น มอบความโปร่งใสให้ลูกค้า และมีเครื่องมือการจัดการที่ทรงพลังสำหรับผู้จัดการ

## ✨ ฟีเจอร์หลัก

### 👨‍🔧 สำหรับช่างซ่อม
- **จัดการอะไหล่**
  - เพิ่ม, ลบ, และแก้ไขอะไหล่ในคลัง
  - ติดตามการใช้อะไหล่พร้อมปรับปรุงคลังอัตโนมัติ
- **รับเรื่องรถ**
  - ลงทะเบียนรถพร้อมข้อมูลครบถ้วน (ยี่ห้อ, เลขไมล์, เลขทะเบียน, สี, รุ่น)
  - บันทึกวันที่บริการ (วันเข้าซ่อมและวันซ่อมเสร็จ)
- **จัดการข้อมูลซ่อม**
  - บันทึกข้อมูลรถพร้อมสถานะและรายละเอียดการซ่อมรายวัน
  - อัปเดตคลังอะไหล่เมื่อมีการใช้งาน
- **ช่องทางการติดต่อ**
  - เข้าถึงข้อมูลติดต่อช่าง ผู้จัดการ และไลน์
- **ระบบจองคิว**
  - ตรวจสอบงานในวันนี้ (ซ่อมรถ/คิวงาน)
- **แดชบอร์ดช่าง**
  - ภาพรวมข้อมูลรายวัน:
    - งานซ่อมที่ทำเสร็จแล้ว
    - อะไหล่ที่ใช้
    - รายรับรายวัน
    - รวมยอดเงินทั้งหมด

### 👥 สำหรับลูกค้า
- **ระบบค้นหาทะเบียนรถ**
  - ค้นหาด้วยเลขทะเบียน
  - ดูประวัติการซ่อมทั้งหมด:
    - จำนวนครั้งที่เข้ารับบริการ
    - ประวัติการซ่อมแต่ละครั้งโดยละเอียด
- **จองคิวล่วงหน้า**
  - **นัดวันเอารถเข้าซ่อมล่วงหน้า**:
    - วันที่ เวลา รายละเอียด
    - ปัญหาที่ต้องการได้รับการแก้ไข

### 👔 สำหรับผู้จัดการ
- **จัดการอะไหล่**
  - เพิ่มอะไหล่ใหม่เข้าคลัง
  - ควบคุมสต็อกอย่างครอบคลุม
  - เครื่องมือวิเคราะห์และรายงาน

## 🚀 เริ่มต้นใช้งาน

เข้าใช้งานระบบได้ที่: [https://autocar2.vercel.app/](https://autocar2.vercel.app/)

## 💻 เทคโนโลยีที่ใช้

- **ฟรอนต์เอนด์**: Next.js 15, Tailwind CSS, React
- **แบ็คเอนด์**: Node.js, Express
- **ฐานข้อมูล**: MYSQL Tidb
- **การออกแบบ**: Tailwind CSS พร้อมคอมโพเนนต์แบบกำหนดเอง





พัฒนาด้วย ❤️ โดยนักศึกษาสาขาวิชา วิศวกรรมซอฟต์แวร์ 66
