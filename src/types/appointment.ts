export interface Appointment {
    id: number;
    user_id: number;
    service: string;
    repair_details: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    created_at: string;
    user?: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  }
  
  export interface TodayAppointment {
    id: number;
    time: string;
    customerName: string;
    phone: string;
    service: string;
    repair_details: string;
    status: string;
  }