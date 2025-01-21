import { ReactNode } from "react";

// types/repairs.ts
export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    license_plate: string;
    color?: string;
    created_at: string;
    updated_at: string;
}

export interface Repair {
    customer_phone: string;
    customer_name: ReactNode;
    parts_cost: number;
    labor_cost: number;
    expected_completion_date(expected_completion_date: any): ReactNode;
    mechanic: any;
    final_cost: any;
    estimated_cost: any;
    customer: any;
    license_plate: ReactNode;
    model: ReactNode;
    brand: ReactNode;
    id: number;
    vehicle_id: number;
    mileage: number;
    start_date: string;
    expected_end_date?: string;
    actual_end_date?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    description?: string;
    technician_id?: number;
    created_at: string;
    updated_at: string;
    vehicle: Vehicle;
    completion_date: string | null;
}