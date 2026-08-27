CREATE TABLE plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price_cents INTEGER NOT NULL,
    max_usage INTEGER NOT NULL,
    features TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organization(id),
    plan_id UUID NOT NULL REFERENCES plan(id),
    status VARCHAR(20) NOT NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Seed the three plans with fixed IDs so application code can reference "Free" reliably
INSERT INTO plan (id, name, price_cents, max_usage, features) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Free', 0, 1000,
        'Up to 1,000 API calls/mo,Community support'),
    ('22222222-2222-2222-2222-222222222222', 'Pro', 4900, 50000,
        'Up to 50,000 API calls/mo,Priority support,Usage analytics'),
    ('33333333-3333-3333-3333-333333333333', 'Enterprise', 19900, 1000000,
        'Up to 1,000,000 API calls/mo,Dedicated support,Custom integrations');