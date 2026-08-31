CREATE TABLE billing_cycle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organization(id),
    subscription_id UUID NOT NULL REFERENCES subscription(id),
    billing_month DATE NOT NULL,
    invoice_id UUID REFERENCES invoice(id),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (organization_id, billing_month)
);

CREATE INDEX idx_billing_cycle_org ON billing_cycle(organization_id);

ALTER TABLE subscription
    ADD COLUMN next_billing_date TIMESTAMP,
    ADD COLUMN autopay_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN gateway_customer_id VARCHAR(100),
    ADD COLUMN gateway_payment_token VARCHAR(100);

UPDATE subscription SET next_billing_date = current_period_end WHERE next_billing_date IS NULL;