package com.subtrack.subtrack.payment;

import com.subtrack.subtrack.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay/{invoiceId}")
    public PaymentResponse payInvoice(@PathVariable UUID invoiceId) {
        return paymentService.initiatePayment(invoiceId);
    }

    @GetMapping("/invoice/{invoiceId}")
    public List<PaymentResponse> listPayments(@PathVariable UUID invoiceId) {
        return paymentService.listPaymentsForInvoice(invoiceId);
    }
}