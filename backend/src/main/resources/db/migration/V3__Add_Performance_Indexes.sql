-- -----------------------------------------------------------------------------
-- V3: Performance Indexes
-- -----------------------------------------------------------------------------

-- Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_bed_id ON tenants(bed_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_kyc_status ON tenants(kyc_status);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_property_id ON invoices(property_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_billing_month ON invoices(billing_month);
-- Composite index for dashboard queries calculating pending amounts by property
CREATE INDEX IF NOT EXISTS idx_invoices_prop_status ON invoices(property_id, status);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Tenant Ledger (Assuming it exists, or referencing payments/invoices)
-- V1 schema didn't explicitly have tenant_ledgers, but the system logs these events.
-- We will index the audit logs and complaints which do exist in V1.

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Complaints
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_id ON complaints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_property_id ON complaints(property_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_assignee_id ON complaints(assignee_id);
-- Composite index for manager dashboard filtering open complaints by property
CREATE INDEX IF NOT EXISTS idx_complaints_prop_status ON complaints(property_id, status);

-- Rooms & Beds
CREATE INDEX IF NOT EXISTS idx_rooms_property_status ON rooms(property_id, status);
CREATE INDEX IF NOT EXISTS idx_beds_room_status ON beds(room_id, status);
