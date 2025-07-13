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
    CF?: string;
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
    CF?: string;
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

// Admin Staff Management interfaces
export interface AdminStaff {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    CF?: string;
    assigned_work_orders_count: number;
    active_work_orders_count: number;
    created_at: string;
}

export interface AdminStaffDetails {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    CF?: string;
    created_at: string;
}

export interface AdminStaffStatistics {
    total_work_orders: number;
    completed_work_orders: number;
    active_work_orders: number;
    completion_rate: number;
}

// Admin Work Order interfaces
export interface AdminWorkOrder {
    id: number;
    type: 'work_order' | 'work_session';
    type_label: string;
    description: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    hours_worked: number;
    total_cost: number;
    labor_cost?: number;
    parts_cost?: number;
    customer: string;
    customer_email: string;
    motorcycle: string;
    motorcycle_plate: string;
    mechanics: AdminWorkOrderMechanic[];
    appointment_id?: number;
    work_type?: string;
    cause?: string;
    name?: string;
    created_at: string;
    assigned_at?: string;
    pivot_started_at?: string;
    pivot_completed_at?: string;
    pivot_notes?: string;
}

export interface AdminWorkOrderMechanic {
    id: number;
    name: string;
    email?: string;
    assigned_at?: string;
    started_at?: string;
    completed_at?: string;
}

export interface AdminWorkOrderDetails {
    id: number;
    type: 'work_order' | 'work_session';
    type_label: string;
    description: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    hours_worked: number;
    total_cost: number;
    labor_cost?: number;
    parts_cost?: number;
    work_type?: string;
    cause?: string;
    name?: string;
    notes?: string;
    created_at: string;
}

export interface AdminWorkOrderCustomer {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

export interface AdminWorkOrderMotorcycle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
    vin: string;
}

export interface AdminWorkOrderPart {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface AdminWorkOrderAppointment {
    id: number;
    date: string;
    time: string;
    type: string;
}

export interface AdminWorkOrderInvoice {
    id: number;
    invoice_number: string;
    status: string;
    total_amount: number;
}

export interface AdminWorkOrderStatistics {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    work_orders_count?: number;
    work_sessions_count?: number;
}

// Form interfaces for creating/editing
export interface CustomerOption {
    id: number;
    name: string;
    email: string;
    motorcycles: MotorcycleOption[];
}

export interface MotorcycleOption {
    id: number;
    name: string;
    plate: string;
    year: number;
}

export interface MechanicOption {
    id: number;
    name: string;
    email: string;
}

export interface AppointmentOption {
    id: number;
    customer: string;
    motorcycle: string;
    date: string;
    time: string;
    type: string;
}

// Admin Inventory Management interfaces
export interface AdminPart {
    id: number;
    part_code: string;
    brand: string;
    name: string;
    description?: string;
    supplier_price: number;
    selling_price: number;
    category: string;
    stock_quantity: number;
    minimum_stock: number;
    supplier_id: number;
    supplier_name: string;
    is_low_stock: boolean;
    created_at: string;
}

export interface AdminPartDetails {
    id: number;
    part_code: string;
    brand: string;
    name: string;
    description?: string;
    supplier_price: number;
    selling_price: number;
    category: string;
    stock_quantity: number;
    minimum_stock: number;
    supplier_id: number;
    supplier_name: string;
    is_low_stock: boolean;
    created_at: string;
}

export interface AdminSupplier {
    id: number;
    supplier_code: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country: string;
    notes?: string;
    parts_count: number;
    created_at: string;
}

export interface AdminSupplierDetails {
    id: number;
    supplier_code: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country: string;
    notes?: string;
    created_at: string;
}

export interface SupplierOption {
    id: number;
    name: string;
    supplier_code: string;
}

// Admin Financial Management interfaces
export interface AdminFinancialAnalytics {
    current_month_revenue: number;
    previous_month_revenue: number;
    revenue_growth: number;
    monthly_revenue: MonthlyRevenue[];
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
}

export interface AdminInvoiceStatistics {
    total_invoices: number;
    paid_invoices: number;
    pending_invoices: number;
    overdue_invoices: number;
    outstanding_payments: number;
}

export interface AdminInvoice {
    id: number;
    invoice_number: string;
    customer: string;
    customer_email: string;
    motorcycle: string;
    work_type: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    status: string;
    paid_at?: string;
    is_overdue: boolean;
    created_at: string;
}

export interface AdminInvoiceDetails {
    id: number;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    status: string;
    paid_at?: string;
    created_at: string;
}

export interface AdminTopCustomer {
    id: number;
    name: string;
    email: string;
    total_revenue: number;
}

export interface AdminFinancialReport {
    date_from: string;
    date_to: string;
    total_revenue: number;
    total_invoices: number;
    paid_invoices: number;
    average_invoice_amount: number;
}

export interface AdminFinancialMonthlyBreakdown {
    month: string;
    revenue: number;
    invoices_count: number;
}

export interface AdminTopCustomerRevenue {
    customer: string;
    revenue: number;
}

// Admin Schedule Management interfaces
export interface AdminScheduleStatistics {
    today_appointments: number;
    pending_appointments: number;
    confirmed_appointments: number;
    completed_appointments: number;
}

export interface AdminWeeklySchedule {
    date: string;
    day_name: string;
    day_number: string;
    appointments: AdminDayAppointment[];
    appointment_count: number;
}

export interface AdminDayAppointment {
    id: number;
    time: string;
    type: string;
    status: string;
    customer: string;
    motorcycle: string;
    plate: string;
}

export interface AdminAppointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    customer: string;
    customer_email: string;
    customer_phone?: string;
    motorcycle: string;
    notes?: string;
    created_at: string;
    has_work_order: boolean;
}

export interface AdminAppointmentDetails {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    notes?: string;
    created_at: string;
}

export interface AdminAppointmentCustomer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    CF?: string;
}

export interface AdminAppointmentMotorcycle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
    vin: string;
    engine_size: number;
}

export interface AdminUpcomingAppointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    customer: string;
    motorcycle: string;
    plate: string;
}
