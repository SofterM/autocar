// src/types/user.ts
import { RowDataPacket } from 'mysql2/promise'

export interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'technician' | 'staff';
  phone: string | null;
  google_id?: string | null;
  profile_image?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'technician' | 'staff';
  phone: string | null;
  profileImage?: string | null;
  createdAt?: Date;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: Date;
}