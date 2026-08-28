package com.subtrack.subtrack;

import com.subtrack.subtrack.organization.Organization;
import com.subtrack.subtrack.organization.OrganizationRepository;
import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.subscription.SubscriptionStatus;
import com.subtrack.subtrack.user.Role;
import com.subtrack.subtrack.user.User;
import com.subtrack.subtrack.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private static final UUID FREE_PLAN_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID PRO_PLAN_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID ENTERPRISE_PLAN_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedOrg("Acme Inc", "owner@acme.com", PRO_PLAN_ID, SubscriptionStatus.ACTIVE);
        seedOrg("Widget Co", "owner@widgetco.com", FREE_PLAN_ID, SubscriptionStatus.TRIAL);
        seedOrg("Globex Corp", "owner@globex.com", ENTERPRISE_PLAN_ID, SubscriptionStatus.ACTIVE);
        seedOrg("Initech", "owner@initech.com", PRO_PLAN_ID, SubscriptionStatus.PAST_DUE);
        seedOrg("Umbrella LLC", "owner@umbrella.com", FREE_PLAN_ID, SubscriptionStatus.CANCELED);

        System.out.println("Seed data created — 5 demo organizations, password for all: demo1234");
    }

    private void seedOrg(String orgName, String email, UUID planId, SubscriptionStatus status) {
        if (userRepository.findByEmail(email).isPresent()) {
            return; // already seeded, skip
        }

        Organization org = new Organization();
        org.setName(orgName);
        organizationRepository.save(org);

        User user = new User();
        user.setOrganizationId(org.getId());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("demo1234"));
        user.setRole(Role.OWNER);
        userRepository.save(user);

        Subscription sub = new Subscription();
        sub.setOrganizationId(org.getId());
        sub.setPlanId(planId);
        sub.setStatus(status);
        sub.setCurrentPeriodStart(Instant.now().minus(15, ChronoUnit.DAYS));
        sub.setCurrentPeriodEnd(Instant.now().plus(15, ChronoUnit.DAYS));
        subscriptionRepository.save(sub);
    }
}