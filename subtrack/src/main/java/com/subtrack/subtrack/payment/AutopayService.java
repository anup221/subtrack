package com.subtrack.subtrack.payment;

import com.razorpay.RazorpayClient;
import com.subtrack.subtrack.billing.Invoice;
import com.subtrack.subtrack.billing.InvoiceRepository;
import com.subtrack.subtrack.billing.InvoiceStatus;
import com.subtrack.subtrack.subscription.Subscription;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AutopayService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final DunningService dunningService;

    /**
     * Charges a saved Razorpay payment token directly — no checkout UI, no user interaction.
     * This is the simplified illustrative version described at the top of this guide: it charges
     * a previously tokenized card via Razorpay's payment creation API using the saved token.
     * A certification-ready recurring-billing system would use Razorpay's Subscriptions/e-mandate
     * APIs, which involve an explicit bank-authorized mandate step beyond what's built here.
     */
    public void attemptAutopayCharge(Subscription sub, UUID invoiceId, int amountCents) {
        int attemptNumber = paymentRepository.countByInvoiceId(invoiceId) + 1;

        Payment payment = new Payment();
        payment.setInvoiceId(invoiceId);
        payment.setOrganizationId(sub.getOrganizationId());
        payment.setAmountCents(amountCents);
        payment.setAttemptNumber(attemptNumber);

        try {
            JSONObject chargeRequest = new JSONObject();
            chargeRequest.put("amount", amountCents);
            chargeRequest.put("currency", "INR");
            chargeRequest.put("customer_id", sub.getGatewayCustomerId());
            chargeRequest.put("token", sub.getGatewayPaymentToken());
            chargeRequest.put("recurring", "1");

            com.razorpay.Payment razorpayPayment = razorpayClient.payments.createRecurringPayment(chargeRequest);
            String status = razorpayPayment.get("status");

            boolean success = "captured".equals(status) || "authorized".equals(status);
            payment.setGatewayReference(razorpayPayment.get("id"));
            payment.setStatus(success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED);

            Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow();
            invoice.setStatus(success ? InvoiceStatus.PAID : InvoiceStatus.FAILED);
            invoiceRepository.save(invoice);

            if (!success) {
                dunningService.handleFailedPayment(invoiceId, attemptNumber);
            }

        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
            if (invoice != null) {
                invoice.setStatus(InvoiceStatus.FAILED);
                invoiceRepository.save(invoice);
            }
            dunningService.handleFailedPayment(invoiceId, attemptNumber);
        }

        paymentRepository.save(payment);
    }
}