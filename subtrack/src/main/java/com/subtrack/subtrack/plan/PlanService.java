package com.subtrack.subtrack.plan;

import com.subtrack.subtrack.plan.dto.CreatePlanRequest;
import com.subtrack.subtrack.plan.dto.PlanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<PlanResponse> listPlans() {
        return planRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PlanResponse createPlan(CreatePlanRequest request) {
        Plan plan = new Plan();
        plan.setName(request.name());
        plan.setPriceCents(request.priceCents());
        plan.setMaxUsage(request.maxUsage());
        plan.setFeatures(request.features());
        planRepository.save(plan);
        return toResponse(plan);
    }

    public PlanResponse toResponse(Plan plan) {
        return new PlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getPriceCents(),
                plan.getMaxUsage(),
                Arrays.asList(plan.getFeatures().split(","))
        );
    }
}