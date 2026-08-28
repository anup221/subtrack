package com.subtrack.subtrack.usage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsageDailySummaryRepository extends JpaRepository<UsageDailySummary, UUID> {
    Optional<UsageDailySummary> findByOrganizationIdAndUsageDate(UUID organizationId, LocalDate usageDate);
    List<UsageDailySummary> findByOrganizationIdAndUsageDateBetweenOrderByUsageDateAsc(
            UUID organizationId, LocalDate start, LocalDate end);

    @Query("""
        SELECT COALESCE(SUM(u.totalUsage), 0)
        FROM UsageDailySummary u
        WHERE u.organizationId = :organizationId
        AND u.usageDate BETWEEN :start AND :end
        """)
    int sumUsageForPeriod(
            @Param("organizationId") UUID organizationId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
}