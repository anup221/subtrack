package com.subtrack.subtrack.billing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface BillingCycleRepository extends JpaRepository<BillingCycle, UUID> {
    Optional<BillingCycle> findByOrganizationIdAndBillingMonth(UUID organizationId, LocalDate billingMonth);
}