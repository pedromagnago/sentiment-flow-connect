-- Add performance indexes for messages and contacts (without time predicates)
CREATE INDEX IF NOT EXISTS idx_messages_contact_created ON messages(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_contact_fromme ON messages(contact_id, fromme, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_id_company ON contacts(id_contact, company_id);