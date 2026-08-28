package com.subtrack.subtrack.admin;

import com.subtrack.subtrack.admin.dto.AdminMetricsResponse;
import com.subtrack.subtrack.admin.dto.TenantSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
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
}