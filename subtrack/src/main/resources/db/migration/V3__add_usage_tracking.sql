CREATE TABLE usage_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organization(id),
    quantity INTEGER NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_record_org_recorded ON usage_record(organization_id, recorded_at);

CREATE TABLE usage_daily_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organization(id),
    usage_date DATE NOT NULL,
    total_usage INTEGER NOT NULL DEFAULT 0,
    UNIQUE (organization_id, usage_date)
);