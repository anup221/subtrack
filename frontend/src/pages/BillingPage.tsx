import { useState } from "react"
import { useSearchParams } from "react-router-dom"

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  ChevronRight,
  CreditCard,
  FileText,
  Receipt,
  X,
} from "lucide-react"

import {
  getCurrentSubscription,
  createRazorpayOrder,
  getInvoices,
  getPayments,
  verifyRazorpayPayment,
} from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"

import {
  paymentStatusStyles,
} from "@/lib/statusStyles"

export default function BillingPage() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  const [selectedId, setSelectedId] = useState<string | null>(
    () => searchParams.get("invoice")
  )

  const [
    razorpayLoading,
    setRazorpayLoading,
  ] = useState<string | null>(null)

  const {
    data: subscription,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: getCurrentSubscription,
  })

  const {
    data: invoices,
    isLoading,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  })

const {
    data: payments,
  } = useQuery({
    queryKey: [
      "payments",
      selectedId,
    ],
    queryFn: () =>
      getPayments(selectedId!),
    enabled: !!selectedId,
  })

  const selected = invoices?.find(
    (invoice) => invoice.id === selectedId
  ) ?? null

  async function payWithRazorpay(
    invoiceId: string
  ) {
    setRazorpayLoading(invoiceId)

    try {
      const order =
        await createRazorpayOrder(
          invoiceId
        )

      if (
        typeof window.Razorpay !==
        "function"
      ) {
        throw new Error(
          "Razorpay checkout is unavailable"
        )
      }

      const razorpay =
        new window.Razorpay({
          key: order.keyId,
          amount:
            order.amountCents,
          currency:
            order.currency,
          name: "SubTrack",
          description:
            "Invoice payment",
          order_id:
            order.razorpayOrderId,

          /*
           * UI-only Razorpay change.
           * Does not affect payment functionality.
           */
          theme: {
            color: "#8b6bff",
          },

          handler:
            async (response) => {
              try {
                await verifyRazorpayPayment(
                  {
                    invoiceId:
                      order.invoiceId,

                    razorpayOrderId:
                      response.razorpay_order_id,

                    razorpayPaymentId:
                      response.razorpay_payment_id,

                    razorpaySignature:
                      response.razorpay_signature,
                  }
                )

                await Promise.all([
                  queryClient.invalidateQueries({
                    queryKey: ["invoices"],
                  }),

                  queryClient.invalidateQueries({
                    queryKey: ["payments"],
                  }),

                  queryClient.invalidateQueries({
                    queryKey: ["subscription"],
                  }),
                ])
              } finally {
                setRazorpayLoading(null)
              }
            },
        })

      razorpay.open()
    } catch {
      setRazorpayLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <p className="eyebrow">
              Billing
            </p>

            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Loading invoices…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* --------------------------------
          HEADER
      -------------------------------- */}

      <PageHeader
        eyebrow="Invoicing"
        title="Billing"
        description="Invoices and payment history for your organization only."
      />

      {/* SCHEDULED PLAN CHANGE */}

      {subscription?.scheduledPlan && (
        <div className="rounded-xl border border-[var(--st-border)] bg-[var(--st-surface)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--st-success)]/30 bg-[var(--st-success)]/10">
              <Receipt size={14} className="text-[var(--st-success)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--st-text)]">
                Plan change scheduled
              </p>
              <p className="mt-0.5 text-xs text-[var(--st-text-muted)]">
                Your subscription will switch to{" "}
                <span className="font-semibold text-[var(--st-text)]">
                  {subscription.scheduledPlan.name}
                </span>{" "}
                at the start of the next billing cycle on{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------
          EMPTY STATE
      -------------------------------- */}

      {invoices?.length === 0 && (
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]">
              <FileText
                size={21}
                className="text-[var(--text-muted)]"
              />
            </div>

            <p className="mt-5 text-base font-medium text-[var(--text)]">
              No invoices yet
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
              Paid plan changes and recurring billing invoices will appear here.
            </p>
          </div>
        </Card>
      )}

      {/* --------------------------------
          INVOICE LIST
      -------------------------------- */}

      {invoices &&
        invoices.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow">
                  Invoices
                </p>

                <h2 className="display mt-1 text-3xl">
                  Billing history
                </h2>
              </div>

              <span className="text-sm text-[var(--text-muted)]">
                {invoices.length}{" "}
                {invoices.length === 1
                  ? "invoice"
                  : "invoices"}
              </span>
            </div>

            <div className="overflow-hidden rounded-[var(--st-radius)] border border-[var(--border)] bg-[var(--surface)]">
              {/* TABLE HEADER */}

              <div className="hidden grid-cols-[minmax(240px,1.7fr)_140px_140px_220px] items-center gap-6 border-b border-[var(--border)] bg-[var(--surface-raised)] px-6 py-3 md:grid">
                <span className="eyebrow">
                  Period
                </span>

                <span className="eyebrow">
                  Status
                </span>

                <span className="eyebrow text-right">
                  Amount
                </span>

                <span className="eyebrow text-right">
                  Actions
                </span>
              </div>

              {/* INVOICE ROWS */}

              <div>
                {invoices.map(
                  (
                    invoice,
                    index
                  ) => {
                    const isSelected =
                      selected?.id ===
                      invoice.id

                    const isPaid =
                      invoice.status ===
                      "PAID"

                    return (
                      <div
                        key={invoice.id}
                        onClick={() =>
                          setSelectedId(
                            invoice.id
                          )
                        }
                        className={`
                          group
                          grid
                          cursor-pointer
                          grid-cols-1
                          gap-5
                          px-6
                          py-5
                          transition-colors
                          duration-150
                          md:grid-cols-[minmax(240px,1.7fr)_140px_140px_220px]
                          md:items-center
                          md:gap-6
                          ${
                            index !==
                            invoices.length -
                              1
                              ? "border-b border-[var(--border)]"
                              : ""
                          }
                          ${
                            isSelected
                              ? "bg-[var(--surface-hover)]"
                              : "hover:bg-[var(--surface-hover)]"
                          }
                        `}
                      >
                        {/* PERIOD */}

                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] transition-colors group-hover:border-[var(--border-strong)]">
                              <FileText
                                size={16}
                                className="text-[var(--text-muted)]"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--text)]">
                                {new Date(
                                  invoice.periodStart
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    month:
                                      "short",
                                    day:
                                      "numeric",
                                    year:
                                      "numeric",
                                  }
                                )}
                                {" – "}
                                {new Date(
                                  invoice.periodEnd
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    month:
                                      "short",
                                    day:
                                      "numeric",
                                    year:
                                      "numeric",
                                  }
                                )}
                              </p>

                              <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--text-faint)]">
                                Invoice
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* STATUS */}

                        <div className="flex items-center justify-between md:block">
                          <span className="text-xs text-[var(--text-faint)] md:hidden">
                            Status
                          </span>

                          <Badge
                            className={
                              paymentStatusStyles[
                                invoice.status
                              ]
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>

                        {/* AMOUNT */}

                        <div className="flex items-center justify-between md:block md:text-right">
                          <span className="text-xs text-[var(--text-faint)] md:hidden">
                            Amount
                          </span>

                          <span className="numeric text-base font-medium text-[var(--text)]">
                            $
                            {(
                              invoice.totalCents /
                              100
                            ).toFixed(2)}
                          </span>
                        </div>

                        {/* ACTIONS */}

                        <div
                          className="flex items-center justify-between gap-3 md:justify-end"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                        >
                          {isPaid ? (
                            <span className="eyebrow">
                              Settled
                            </span>
                          ) : (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  payWithRazorpay(
                                    invoice.id
                                  )
                                }
                                disabled={
                                  razorpayLoading ===
                                  invoice.id
                                }
                              >
                                {razorpayLoading ===
                                invoice.id
                                  ? "Opening..."
                                  : "Razorpay"}
                              </Button>
                            </div>
                          )}

                          <ChevronRight
                            size={17}
                            className="hidden shrink-0 text-[var(--text-faint)] transition-transform group-hover:translate-x-0.5 md:block"
                          />
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </section>
        )}

      {/* --------------------------------
          INVOICE DETAIL
      -------------------------------- */}

      {selected && (
        <Card
          className="overflow-hidden border-[var(--border)] bg-[var(--surface)] p-0"
        >
          {/* DETAIL HEADER */}

          <div className="flex items-start justify-between gap-6 border-b border-[var(--border)] px-6 py-6 md:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]">
                <Receipt
                  size={19}
                  className="text-[var(--accent)]"
                />
              </div>

              <div>
                <p className="eyebrow">
                  Invoice detail
                </p>

                <h2 className="display mt-1 text-3xl">
                  Invoice
                </h2>

                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {new Date(
                    selected.periodStart
                  ).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                  {" – "}
                  {new Date(
                    selected.periodEnd
                  ).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSelectedId(null)
              }
              className="gap-2"
            >
              <X size={15} />
              Close
            </Button>
          </div>

          {/* LINE ITEMS */}

          <div className="px-6 md:px-7">
            <div className="border-b border-[var(--border)] py-5">
              <p className="eyebrow mb-4">
                Line items
              </p>

              <div className="space-y-1">
                {selected.lineItems.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-6 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text)]">
                          {item.description}
                        </p>

                        {item.quantity !=
                          null && (
                          <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--text-faint)]">
                            Qty ×{" "}
                            {item.quantity}
                          </p>
                        )}
                      </div>

                      <p className="numeric shrink-0 text-sm font-medium text-[var(--text)]">
                        $
                        {(
                          item.amountCents /
                          100
                        ).toFixed(2)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* TOTAL */}

            <div className="flex items-center justify-between border-b border-[var(--border)] py-6">
              <div>
                <p className="eyebrow">
                  Total
                </p>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Amount due for this
                  invoice
                </p>
              </div>

              <span className="numeric text-2xl font-medium text-[var(--text)]">
                $
                {(
                  selected.totalCents /
                  100
                ).toFixed(2)}
              </span>
            </div>

            {/* PAYMENT ATTEMPTS */}

            {payments &&
              payments.length > 0 && (
                <div className="py-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="eyebrow">
                      Payment attempts
                    </p>

                    <span className="text-xs text-[var(--text-faint)]">
                      {payments.length}{" "}
                      {payments.length ===
                      1
                        ? "attempt"
                        : "attempts"}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                    {payments.map(
                      (
                        payment,
                        index
                      ) => (
                        <div
                          key={payment.id}
                          className={`
                            flex
                            items-center
                            justify-between
                            gap-4
                            px-4
                            py-3.5
                            ${
                              index !==
                              payments.length -
                                1
                                ? "border-b border-[var(--border)]"
                                : ""
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-raised)]">
                              <CreditCard
                                size={14}
                                className="text-[var(--text-muted)]"
                              />
                            </div>

                            <span className="text-sm text-[var(--text-muted)]">
                              Attempt #
                              {
                                payment.attemptNumber
                              }
                            </span>
                          </div>

                          <Badge
                            className={
                              paymentStatusStyles[
                                payment.status
                              ]
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </Card>
      )}
    </div>
  )
}
