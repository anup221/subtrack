CREATE TABLE invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organization(id),
    subscription_id UUID NOT NULL REFERENCES subscription(id),
    status VARCHAR(20) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_cents INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE invoice_line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoice(id),
    description VARCHAR(255) NOT NULL,
    amount_cents INTEGER NOT NULL,
    quantity INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_org ON invoice(organization_id);
CREATE INDEX idx_invoice_line_item_invoice ON invoice_line_item(invoice_id);