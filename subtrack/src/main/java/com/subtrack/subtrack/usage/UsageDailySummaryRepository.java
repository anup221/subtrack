package com.subtrack.subtrack.usage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsageDailySummaryRepository extends JpaRepository<UsageDailySummary, UUID> {
    Optional<UsageDailySummary> findByOrganizationIdAndUsageDate(UUID organizationId, LocalDate usageDate);
    List<UsageDailySummary> findByOrganizationIdAndUsageDateBetweenOrderByUsageDateAsc(
            UUID organizationId, LocalDate start, LocalDate end);
}