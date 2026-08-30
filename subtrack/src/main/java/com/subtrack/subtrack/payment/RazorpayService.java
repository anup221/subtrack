package com.subtrack.subtrack.payment;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.subtrack.subtrack.billing.Invoice;
import com.subtrack.subtrack.billing.InvoiceRepository;
import com.subtrack.subtrack.billing.InvoiceStatus;
import com.subtrack.subtrack.payment.dto.CreateOrderResponse;
import com.subtrack.subtrack.payment.dto.PaymentResponse;
import com.subtrack.subtrack.payment.dto.VerifyPaymentRequest;
import com.subtrack.subtrack.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final RazorpayClient razorpayClient;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final DunningService dunningService;

    @Value("${razorpay.key-id}")
    private String keyId;

    public CreateOrderResponse createOrder(UUID invoiceId) throws Exception {
        UUID organizationId = TenantContext.get();

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalStateException("Invoice not found"));

        if (!invoice.getOrganizationId().equals(organizationId)) {
            throw new IllegalStateException("Invoice not found");
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", invoice.getTotalCents()); // Razorpay expects the smallest currency unit (paise for INR) — cents work the same way
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", invoice.getId().toString());

        com.razorpay.Order order = razorpayClient.orders.create(orderRequest);

        return new CreateOrderResponse(
                order.get("id"),
                invoice.getTotalCents(),
                "INR",
                keyId,
                invoice.getId()
        );
    }

    public PaymentResponse verifyAndRecordPayment(VerifyPaymentRequest request) throws Exception {
        UUID organizationId = TenantContext.get();

        Invoice invoice = invoiceRepository.findById(request.invoiceId())
                .orElseThrow(() -> new IllegalStateException("Invoice not found"));

        if (!invoice.getOrganizationId().equals(organizationId)) {
            throw new IllegalStateException("Invoice not found");
        }

        JSONObject verifyPayload = new JSONObject();
        verifyPayload.put("razorpay_order_id", request.razorpayOrderId());
        verifyPayload.put("razorpay_payment_id", request.razorpayPaymentId());
        verifyPayload.put("razorpay_signature", request.razorpaySignature());

        boolean isValid = Utils.verifyPaymentSignature(verifyPayload, keySecretForVerification());

        int attemptNumber = paymentRepository.countByInvoiceId(invoice.getId()) + 1;

        Payment payment = new Payment();
        payment.setInvoiceId(invoice.getId());
        payment.setOrganizationId(organizationId);
        payment.setAmountCents(invoice.getTotalCents());
        payment.setAttemptNumber(attemptNumber);
        payment.setGatewayReference(request.razorpayPaymentId());

        if (isValid) {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            invoice.setStatus(InvoiceStatus.FAILED);
        }

        paymentRepository.save(payment);
        invoiceRepository.save(invoice);

        if (!isValid) {
            dunningService.handleFailedPayment(invoice.getId(), attemptNumber);
        }

        return new PaymentResponse(
                payment.getId(),
                payment.getInvoiceId(),
                payment.getAmountCents(),
                payment.getStatus().name(),
                payment.getAttemptNumber(),
                payment.getCreatedAt()
        );
    }

    // Signature verification needs the raw key secret, not the RazorpayClient object — injected separately.
    @Value("${razorpay.key-secret}")
    private String keySecretForVerification;

    private String keySecretForVerification() {
        return keySecretForVerification;
    }
}