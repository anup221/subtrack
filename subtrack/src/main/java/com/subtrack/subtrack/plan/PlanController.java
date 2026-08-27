package com.subtrack.subtrack.plan;

import com.subtrack.subtrack.plan.dto.CreatePlanRequest;
import com.subtrack.subtrack.plan.dto.PlanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public List<PlanResponse> listPlans() {
        return planService.listPlans();
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public PlanResponse createPlan(@RequestBody CreatePlanRequest request) {
        return planService.createPlan(request);
    }
}