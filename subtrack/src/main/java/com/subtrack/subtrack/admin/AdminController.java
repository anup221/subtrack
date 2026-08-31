package com.subtrack.subtrack.admin;

import com.subtrack.subtrack.admin.dto.AdminMetricsResponse;
import com.subtrack.subtrack.admin.dto.TenantDetailResponse;
import com.subtrack.subtrack.admin.dto.TenantSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public AdminMetricsResponse getMetrics() {
        return adminService.getMetrics();
    }

    @GetMapping("/tenants")
    public List<TenantSummaryResponse> listTenants() {
        return adminService.listTenants();
    }

    @GetMapping("/tenants/{organizationId}")
    public TenantDetailResponse getTenantDetail(@PathVariable UUID organizationId) {
        return adminService.getTenantDetail(organizationId);
    }

    @PostMapping("/tenants/{organizationId}/block")
    public void blockTenant(@PathVariable UUID organizationId) {
        adminService.setTenantStatus(organizationId, "BLOCKED");
    }

    @PostMapping("/tenants/{organizationId}/unblock")
    public void unblockTenant(@PathVariable UUID organizationId) {
        adminService.setTenantStatus(organizationId, "ACTIVE");
    }

    @DeleteMapping("/tenants/{organizationId}")
    public void deleteTenant(@PathVariable UUID organizationId) {
        adminService.setTenantStatus(organizationId, "DELETED");
    }
}