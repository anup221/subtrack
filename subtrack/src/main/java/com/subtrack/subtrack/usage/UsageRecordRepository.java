package com.subtrack.subtrack.usage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface UsageRecordRepository extends JpaRepository<UsageRecord, UUID> {

    @Query("""
        SELECT ur.organizationId AS organizationId, SUM(ur.quantity) AS total
        FROM UsageRecord ur
        WHERE CAST(ur.recordedAt AS date) = :date
        GROUP BY ur.organizationId
        """)
    List<DailyOrgTotal> sumUsageByOrgForDate(@Param("date") LocalDate date);

    interface DailyOrgTotal {
        UUID getOrganizationId();
        Long getTotal();
    }
}