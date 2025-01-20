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
}