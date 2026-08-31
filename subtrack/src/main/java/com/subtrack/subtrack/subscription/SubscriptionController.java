package com.subtrack.subtrack.subscription;

import com.subtrack.subtrack.subscription.dto.AutopayToggleResponse;
import com.subtrack.subtrack.subscription.dto.ChangePlanRequest;
import com.subtrack.subtrack.subscription.dto.ChangePlanResponse;
import com.subtrack.subtrack.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/me")
    public SubscriptionResponse getCurrentSubscription() {
        return subscriptionService.getCurrentSubscription();
    }

    @PostMapping("/change-plan")
    public ChangePlanResponse changePlan(
            @RequestBody ChangePlanRequest request
    ) {
        return subscriptionService.changePlan(request);
    }

    @PostMapping("/cancel")
    public SubscriptionResponse cancel() {
        return subscriptionService.cancel();
    }

    @PostMapping("/autopay/enable")
    public AutopayToggleResponse enableAutopay() {
        return subscriptionService.setAutopay(true);
    }

    @PostMapping("/autopay/disable")
    public AutopayToggleResponse disableAutopay() {
        return subscriptionService.setAutopay(false);
    }
}