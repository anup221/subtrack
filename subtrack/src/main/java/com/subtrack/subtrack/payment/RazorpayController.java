package com.subtrack.subtrack.payment;

import com.subtrack.subtrack.payment.dto.CreateOrderResponse;
import com.subtrack.subtrack.payment.dto.PaymentResponse;
import com.subtrack.subtrack.payment.dto.VerifyPaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments/razorpay")
@RequiredArgsConstructor
public class RazorpayController {

    private final RazorpayService razorpayService;

    @PostMapping("/create-order/{invoiceId}")
    public CreateOrderResponse createOrder(@PathVariable UUID invoiceId) throws Exception {
        return razorpayService.createOrder(invoiceId);
    }

    @PostMapping("/verify")
    public PaymentResponse verify(@RequestBody VerifyPaymentRequest request) throws Exception {
        return razorpayService.verifyAndRecordPayment(request);
    }
}