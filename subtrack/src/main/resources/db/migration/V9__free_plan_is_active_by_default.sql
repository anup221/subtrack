-- The Free plan is now the default starting plan for every organization with
-- an ACTIVE subscription (no trial). Free is $0 and never generates an invoice,
-- so a trial period is unnecessary. Convert any remaining Free-plan TRIAL
-- subscriptions left over from earlier versions to ACTIVE; paid-plan TRIAL
-- subscriptions are left untouched (they represent real paid trials).
UPDATE subscription
SET status = 'ACTIVE'
WHERE status = 'TRIAL'
  AND plan_id = '11111111-1111-1111-1111-111111111111';
