// types/index.ts
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    phone: string;
}

export interface Technician {
    id: string;
    name: string;
    position: string;
    status: string;
    salary: number | null;  // เพิ่ม salary
    user_id: string;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
}

export interface Contact {
    id: string;
    facebook: string;
    line: string;
    email: string;
    technician_phone: string;
    manager_phone: string;
    address: string;
    created_at?: Date;
    updated_at?: Date;
  }


  