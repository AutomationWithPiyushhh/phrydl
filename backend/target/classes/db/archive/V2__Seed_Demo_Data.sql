-- Insert Mock Admin User
INSERT INTO users (id, email, password_hash, first_name, last_name, role) 
VALUES ('11111111-1111-1111-1111-111111111111', 'admin@phrydlpg.com', '$2a$10$xyz', 'Admin', 'User', 'ADMIN');

-- Insert Mock Tenant Users
INSERT INTO users (id, email, password_hash, first_name, last_name, role) 
VALUES 
('22222222-2222-2222-2222-222222222222', 'rahul@example.com', '$2a$10$xyz', 'Rahul', 'Sharma', 'TENANT'),
('33333333-3333-3333-3333-333333333333', 'sneha@example.com', '$2a$10$xyz', 'Sneha', 'Patel', 'TENANT');

-- Insert Properties
INSERT INTO properties (id, name, address, capacity, type, manager_id) 
VALUES 
('44444444-4444-4444-4444-444444444444', 'Phrydl Kormangala', 'Kormangala Block 5, Bangalore', 120, 'Co-living', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555555', 'Phrydl HSR', 'HSR Layout Sector 2', 150, 'Co-living', '11111111-1111-1111-1111-111111111111');

-- Insert Rooms
INSERT INTO rooms (id, property_id, room_number, type) 
VALUES 
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '201-A', '2-Sharing'),
('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', '105-B', '2-Sharing');

-- Insert Beds
INSERT INTO beds (id, room_id, bed_number) 
VALUES 
('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'B1'),
('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'B1');

-- Insert Tenants
INSERT INTO tenants (id, user_id, bed_id, tenant_code, monthly_rent, security_deposit, status) 
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'T-1045', 12500.00, 25000.00, 'ACTIVE'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'T-1046', 14000.00, 28000.00, 'ACTIVE');

-- Insert Payments
INSERT INTO payments (id, tenant_id, transaction_ref, amount, type, method, status) 
VALUES 
(gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TRX-9821', 12500.00, 'Rent', 'UPI', 'COMPLETED'),
(gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TRX-9820', 8000.00, 'Partial Rent', 'Card', 'COMPLETED');

-- Insert Expenses
INSERT INTO expenses (id, property_id, category, amount, status, expense_date, description) 
VALUES 
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Electricity', 45200.00, 'PAID', CURRENT_DATE, 'June Bill'),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Water', 18500.00, 'PAID', CURRENT_DATE, 'June Bill');

-- Insert Complaints
INSERT INTO complaints (id, tenant_id, property_id, ticket_ref, title, priority, status) 
VALUES 
(gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'TKT-101', 'AC not cooling', 'High', 'OPEN'),
(gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'TKT-102', 'Geyser leak', 'Critical', 'OPEN');
