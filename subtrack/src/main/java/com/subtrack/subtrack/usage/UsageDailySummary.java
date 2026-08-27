package com.subtrack.subtrack.usage;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "usage_daily_summary")
@Getter
@Setter
public class UsageDailySummary {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "total_usage", nullable = false)
    private int totalUsage;
}