import React from 'react';

export default function Dashboard(props) {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {props.auth.user.name}</p>

            <h2>Quick Stats</h2>
            <p>Current Month Revenue: {props.currentMonthRevenue}</p>
            <p>Active Work Orders: {props.activeWorkOrdersCount}</p>
            <p>Pending Appointments: {props.pendingAppointmentsCount}</p>
            <p>Total Customers: {props.totalCustomersCount}</p>

            <h2>Recent Work Orders</h2>
            <ul>
                {props.recentWorkOrders.map(order => (
                    <li key={order.id}>{order.description}</li>
                ))}
            </ul>

            <h2>Recent Appointments</h2>
            <ul>
                {props.recentAppointments.map(appointment => (
                    <li key={appointment.id}>{appointment.type} for {appointment.motorcycle}</li>
                ))}
            </ul>
        </div>
    );
}
