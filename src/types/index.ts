import { Prisma } from "@prisma/client";

// Appointment with relations
export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    client: true;
    services: {
      include: {
        service: true;
      };
    };
  };
}>;

// Client with appointments count
export type ClientWithAppointments = Prisma.ClientGetPayload<{
  include: {
    appointments: true;
  };
}>;

// Service with usage count
export type ServiceWithUsage = Prisma.ServiceGetPayload<{
  include: {
    appointments: true;
  };
}>;

// Dashboard stats
export interface DashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  monthRevenue: number;
  totalClients: number;
  upcomingAppointments: AppointmentWithRelations[];
}

// Time slot for booking
export interface TimeSlot {
  time: string;
  available: boolean;
}

// Booking form data
export interface BookingFormData {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceIds: string[];
  date: string;
  time: string;
  notes?: string;
}

// n8n webhook payload
export interface N8nWebhookPayload {
  event:
    | "appointment.created"
    | "appointment.confirmed"
    | "appointment.cancelled"
    | "appointment.reminder";
  appointment: AppointmentWithRelations;
  businessName: string;
}
