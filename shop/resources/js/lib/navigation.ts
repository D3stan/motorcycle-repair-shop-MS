import { type NavItem, type User } from '@/types';

// Customer navigation items
const customerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'My Garage',
        href: '/garage',
    },
    {
        title: 'Appointments',
        href: '/appointments',
    },
    {
        title: 'Work Orders',
        href: '/work-orders',
    },
    {
        title: 'Invoices',
        href: '/invoices',
    },
];

// Admin navigation items based on instructions
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Customer Management',
        href: '/admin/customers',
    },
    {
        title: 'Motorcycle Management',
        href: '/admin/motorcycles',
    },
    {
        title: 'Staff Management',
        href: '/admin/staff',
    },
    {
        title: 'Work Orders',
        href: '/admin/work-orders',
    },
    {
        title: 'Inventory',
        href: '/admin/inventory',
    },
    {
        title: 'Suppliers',
        href: '/admin/suppliers',
    },
    {
        title: 'Financial',
        href: '/admin/financial',
    },
    {
        title: 'Schedule',
        href: '/admin/schedule',
    },
];

// Mechanic navigation items
const mechanicNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'My Work Orders',
        href: '/mechanic/work-orders',
    },
    {
        title: 'Schedule',
        href: '/mechanic/schedule',
    },
    {
        title: 'Parts & Inventory',
        href: '/mechanic/inventory',
    },
];

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(user: User): NavItem[] {
    switch (user.type) {
        case 'admin':
            return adminNavItems;
        case 'mechanic':
            return mechanicNavItems;
        case 'customer':
        default:
            return customerNavItems;
    }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: User): boolean {
    return user.type === 'admin';
}

/**
 * Check if user has mechanic role
 */
export function isMechanic(user: User): boolean {
    return user.type === 'mechanic';
}

/**
 * Check if user has customer role
 */
export function isCustomer(user: User): boolean {
    return user.type === 'customer';
} 