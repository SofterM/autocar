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
    id: number;
    user_id: number;
    name: string;
    position: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export type ContactChannel = {
    id?: string;
    type: 'website' | 'phone' | 'email';
    value: string;
    description: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}
