-- Staged plan changes are applied only after a successful payment.
ALTER TABLE subscription
    ADD COLUMN pending_plan_id UUID REFERENCES plan(id),
    ADD COLUMN pending_plan_invoice_id UUID;

ALTER TABLE invoice
    ADD COLUMN invoice_type VARCHAR(30) NOT NULL DEFAULT 'RECURRING',
    ADD COLUMN target_plan_id UUID REFERENCES plan(id),
    ADD COLUMN gateway_order_id VARCHAR(100),
    ADD COLUMN gateway_order_created_at TIMESTAMP,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE payment ADD COLUMN gateway_order_id VARCHAR(100);

CREATE UNIQUE INDEX uq_invoice_gateway_order ON invoice(gateway_order_id)
    WHERE gateway_order_id IS NOT NULL;
CREATE UNIQUE INDEX uq_payment_gateway_reference ON payment(gateway_reference)
    WHERE gateway_reference IS NOT NULL;
CREATE UNIQUE INDEX uq_open_plan_change_invoice ON invoice(organization_id)
    WHERE invoice_type = 'PLAN_CHANGE' AND status = 'PENDING';
