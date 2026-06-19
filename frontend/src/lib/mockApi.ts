import MockAdapter from 'axios-mock-adapter';
import { api } from './api';

const mock = new MockAdapter(api, { delayResponse: 500 });

// -----------------------------------------------------------------------------
// Authentication
// -----------------------------------------------------------------------------
mock.onPost('/auth/login').reply(200, {
  success: true,
  data: {
    token: 'mock-jwt-token-12345',
    id: 'user-1',
    email: 'admin@phrydlpg.com',
    role: 'SUPER_ADMIN'
  }
});

// -----------------------------------------------------------------------------
// Dashboard KPIs
// -----------------------------------------------------------------------------
mock.onGet('/dashboard').reply(200, {
  success: true,
  data: {
    kpis: {
      totalProperties: 3,
      totalTenants: 142,
      activeComplaints: 5,
      occupancyRate: 88,
      monthlyRevenue: 1250000,
      outstandingDues: 45000,
      netProfit: 800000
    },
    revenueTrend: [
      { name: "Jan", current: 900000 },
      { name: "Feb", current: 1000000 },
      { name: "Mar", current: 1100000 },
      { name: "Apr", current: 1150000 },
      { name: "May", current: 1250000 }
    ],
    occupancyTrend: [
      { name: "Sardar Patel", current: 87 },
      { name: "Sabarmati", current: 88 },
      { name: "Gokuldham", current: 93 }
    ],
    recentPayments: [
      { id: 'p1', amount: 8500, tenantName: 'Rahul Patel', date: new Date().toISOString() },
      { id: 'p2', amount: 12000, tenantName: 'Sneha Shah', date: new Date().toISOString() },
    ],
    upcomingRenewals: [
      { id: 't1', name: 'Amit Desai', room: '101', daysLeft: 4 }
    ]
  }
});

// -----------------------------------------------------------------------------
// Properties (Ahmedabad focus)
// -----------------------------------------------------------------------------
mock.onGet('/properties').reply(200, {
  success: true,
  data: [
    { id: 'prop-1', name: 'Sardar Patel Co-living', address: 'SG Highway, Bodakdev', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380054', type: 'CO_LIVING', totalRooms: 40, activeTenants: 35, managerName: 'Ramesh Joshi' },
    { id: 'prop-2', name: 'Sabarmati Stays', address: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380009', type: 'BOYS_PG', totalRooms: 25, activeTenants: 22, managerName: 'Jignesh Bhai' },
    { id: 'prop-3', name: 'Gokuldham Premium PG', address: 'Prahlad Nagar', city: 'Ahmedabad', state: 'Gujarat', zipCode: '380015', type: 'GIRLS_PG', totalRooms: 30, activeTenants: 28, managerName: 'Hetal Patel' }
  ]
});

// -----------------------------------------------------------------------------
// Tenants (Gujarati Names)
// -----------------------------------------------------------------------------
mock.onGet('/tenants').reply(200, {
  success: true,
  data: [
    { id: 't-1', name: 'Rahul Patel', email: 'rahul.p@example.com', phone: '+91 9876543210', propertyName: 'Sardar Patel Co-living', roomNumber: '101', bedNumber: 'A', status: 'ACTIVE', rentAmount: 12000, checkInDate: '2025-01-15' },
    { id: 't-2', name: 'Sneha Shah', email: 'sneha.s@example.com', phone: '+91 8765432109', propertyName: 'Gokuldham Premium PG', roomNumber: '205', bedNumber: 'B', status: 'ACTIVE', rentAmount: 8500, checkInDate: '2025-02-01' },
    { id: 't-3', name: 'Amit Desai', email: 'amit.d@example.com', phone: '+91 7654321098', propertyName: 'Sabarmati Stays', roomNumber: '302', bedNumber: 'A', status: 'ACTIVE', rentAmount: 9000, checkInDate: '2024-11-20' },
    { id: 't-4', name: 'Priya Mehta', email: 'priya.m@example.com', phone: '+91 6543210987', propertyName: 'Gokuldham Premium PG', roomNumber: '206', bedNumber: 'C', status: 'NOTICE_PERIOD', rentAmount: 8500, checkInDate: '2024-05-10' },
    { id: 't-5', name: 'Parth Joshi', email: 'parth.j@example.com', phone: '+91 5432109876', propertyName: 'Sardar Patel Co-living', roomNumber: '104', bedNumber: 'B', status: 'PAYMENT_DUE', rentAmount: 11000, checkInDate: '2025-03-01' }
  ]
});

// -----------------------------------------------------------------------------
// Rooms
// -----------------------------------------------------------------------------
mock.onGet('/rooms').reply(200, {
  success: true,
  data: [
    { 
      id: 'r-1', roomNumber: '101', propertyName: 'Sardar Patel Co-living', capacity: 2, type: 'DOUBLE_SHARING', floor: 1, baseRent: 12000,
      beds: [
        { bedNumber: 'A', status: 'OCCUPIED', tenantName: 'Rahul Patel' },
        { bedNumber: 'B', status: 'AVAILABLE' }
      ]
    },
    { 
      id: 'r-2', roomNumber: '104', propertyName: 'Sardar Patel Co-living', capacity: 2, type: 'DOUBLE_SHARING', floor: 1, baseRent: 11000,
      beds: [
        { bedNumber: 'A', status: 'AVAILABLE' },
        { bedNumber: 'B', status: 'OCCUPIED', tenantName: 'Parth Joshi' }
      ]
    },
    { 
      id: 'r-3', roomNumber: '205', propertyName: 'Gokuldham Premium PG', capacity: 3, type: 'TRIPLE_SHARING', floor: 2, baseRent: 8500,
      beds: [
        { bedNumber: 'A', status: 'AVAILABLE' },
        { bedNumber: 'B', status: 'OCCUPIED', tenantName: 'Sneha Shah' },
        { bedNumber: 'C', status: 'MAINTENANCE' }
      ]
    },
    { 
      id: 'r-4', roomNumber: '302', propertyName: 'Sabarmati Stays', capacity: 1, type: 'SINGLE', floor: 3, baseRent: 15000,
      beds: [
        { bedNumber: 'A', status: 'OCCUPIED', tenantName: 'Amit Desai' }
      ]
    }
  ]
});

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------
mock.onGet('/payments').reply(200, {
  success: true,
  data: [
    { id: 'pay-1', tenantName: 'Rahul Patel', propertyName: 'Sardar Patel Co-living', amount: 12000, status: 'COMPLETED', paymentMethod: 'UPI', date: new Date().toISOString(), referenceNumber: 'UPI123456789' },
    { id: 'pay-2', tenantName: 'Sneha Shah', propertyName: 'Gokuldham Premium PG', amount: 8500, status: 'COMPLETED', paymentMethod: 'BANK_TRANSFER', date: new Date(Date.now() - 86400000).toISOString(), referenceNumber: 'HDFC9876543' },
    { id: 'pay-3', tenantName: 'Amit Desai', propertyName: 'Sabarmati Stays', amount: 9000, status: 'PENDING', paymentMethod: 'CASH', date: new Date().toISOString(), referenceNumber: '-' }
  ]
});

// -----------------------------------------------------------------------------
// Expenses
// -----------------------------------------------------------------------------
mock.onGet('/expenses').reply(200, {
  success: true,
  data: [
    { id: 'exp-1', propertyName: 'Sardar Patel Co-living', category: 'ELECTRICITY', amount: 14500, date: new Date().toISOString(), description: 'Torrent Power Bill - May', status: 'PAID' },
    { id: 'exp-2', propertyName: 'Gokuldham Premium PG', category: 'MAINTENANCE', amount: 3500, date: new Date(Date.now() - 172800000).toISOString(), description: 'Plumber - Tap Fix', status: 'PAID' },
    { id: 'exp-3', propertyName: 'Sabarmati Stays', category: 'INTERNET', amount: 4999, date: new Date().toISOString(), description: 'GTPL Broadband Renewal', status: 'PENDING' }
  ]
});

// -----------------------------------------------------------------------------
// Complaints
// -----------------------------------------------------------------------------
mock.onGet('/complaints').reply(200, {
  success: true,
  data: [
    { id: 'c-1', title: 'AC Not Cooling', description: 'AC is blowing warm air since morning.', category: 'ELECTRICAL', priority: 'HIGH', status: 'OPEN', createdAt: new Date().toISOString(), tenantName: 'Rahul Patel', propertyName: 'Sardar Patel Co-living', roomNumber: '101' },
    { id: 'c-2', title: 'Leaking Tap in Bathroom', description: 'Continuous dripping.', category: 'PLUMBING', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 86400000).toISOString(), tenantName: 'Sneha Shah', propertyName: 'Gokuldham Premium PG', roomNumber: '205' },
    { id: 'c-3', title: 'Wi-Fi Speed Drop', description: 'Getting less than 2Mbps on 5G network.', category: 'INTERNET', priority: 'LOW', status: 'RESOLVED', createdAt: new Date(Date.now() - 259200000).toISOString(), tenantName: 'Amit Desai', propertyName: 'Sabarmati Stays', roomNumber: '302' },
    { id: 'c-4', title: 'Geyser not turning on', description: 'No hot water.', category: 'ELECTRICAL', priority: 'CRITICAL', status: 'OPEN', createdAt: new Date().toISOString(), tenantName: 'Parth Joshi', propertyName: 'Sardar Patel Co-living', roomNumber: '104' }
  ]
});

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------
mock.onGet('/notifications').reply(200, {
  success: true,
  data: [
    { id: 'n-1', title: 'New Payment Received', message: 'Rahul Patel paid ₹12,000 for May Rent.', read: false, createdAt: new Date().toISOString() },
    { id: 'n-2', title: 'Critical Complaint', message: 'Geyser issue reported by Parth Joshi.', read: false, createdAt: new Date().toISOString() },
    { id: 'n-3', title: 'Lease Expiring', message: 'Priya Mehta\'s lease expires in 15 days.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
  ]
});

// Pass through any other requests so we don't break real ones if backend IS running
mock.onAny().passThrough();

console.log('[Mock API] Interceptor loaded. UI is running in Ahmedabad Demo mode.');
