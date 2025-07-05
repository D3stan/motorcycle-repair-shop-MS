import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    type: 'customer' | 'mechanic' | 'admin';
    phone?: string;
    tax_code?: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Admin-specific interfaces
export interface AdminCustomer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    tax_code?: string;
    motorcycles_count: number;
    appointments_count: number;
    work_orders_count: number;
    invoices_count: number;
    pending_invoices_count: number;
    created_at: string;
}

export interface AdminMotorcycleModel {
    id: number;
    brand: string;
    name: string;
    model_code: string;
    engine_size: number;
    segment: string;
    power: number;
    motorcycles_count: number;
    created_at: string;
}

export interface CustomerMotorcycle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
    vin: string;
    engine_size: number;
}

export interface CustomerAppointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    motorcycle: string;
    notes?: string;
}

export interface CustomerWorkOrder {
    id: number;
    description: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    total_cost: number;
    motorcycle: string;
}

export interface CustomerInvoice {
    id: number;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    status: string;
    paid_at?: string;
}

export interface MotorcycleOwner {
    id: number;
    license_plate: string;
    registration_year: number;
    vin: string;
    owner: string;
    owner_email: string;
}
