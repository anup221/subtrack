package com.subtrack.subtrack.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByInvoiceIdOrderByCreatedAtDesc(UUID invoiceId);
    int countByInvoiceId(UUID invoiceId);
}