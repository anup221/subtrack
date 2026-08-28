import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Receipt } from "lucide-react"
import { getInvoices, generateInvoice, payInvoice, getPayments, type Invoice } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { paymentStatusStyles } from "@/lib/statusStyles"

export default function BillingPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Invoice | null>(null)

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  })

  const { data: payments } = useQuery({
    queryKey: ["payments", selected?.id],
    queryFn: () => getPayments(selected!.id),
    enabled: !!selected,
  })

  const generateMutation = useMutation({
    mutationFn: generateInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  })

  const payMutation = useMutation({
    mutationFn: payInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
    },
  })

  if (isLoading) {
    return <p className="text-[#8b8b9c]">Loading invoices...</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Invoicing"
        title="Billing"
        description="Invoices and payment history for your organization only."
        actions={
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? "Generating..." : "Generate invoice (test)"}
          </Button>
        }
      />

      <div className="space-y-3">
        {invoices?.length === 0 && (
          <Card className="flex flex-col items-center space-y-2 py-12 text-center">
            <Receipt size={28} className="text-[#5c5c6b]" />
            <p className="text-sm text-[#8b8b9c]">No invoices yet — generate one to start the payment flow.</p>
          </Card>
        )}
        {invoices?.map((invoice) => (
          <Card
            key={invoice.id}
            className="cursor-pointer hover:border-[#7c5cff]/50"
            onClick={() => setSelected(invoice)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-[#8b8b9c]">
                  {new Date(invoice.periodStart).toLocaleDateString()} –{" "}
                  {new Date(invoice.periodEnd).toLocaleDateString()}
                </p>
                <Badge className={paymentStatusStyles[invoice.status]}>{invoice.status}</Badge>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-lg font-semibold">${(invoice.totalCents / 100).toFixed(2)}</p>
                {invoice.status !== "PAID" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      payMutation.mutate(invoice.id)
                    }}
                    disabled={payMutation.isPending}
                  >
                    {payMutation.isPending ? "Charging..." : "Pay now"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <Card className="glow-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Invoice detail</h2>
            <button onClick={() => setSelected(null)} className="text-sm text-[#8b8b9c] hover:text-white">
              Close
            </button>
          </div>

          {selected.lineItems.map((item, i) => (
            <div key={i} className="flex justify-between border-b border-[#262633] py-2 text-sm">
              <span className="text-[#8b8b9c]">
                {item.description}
                {item.quantity != null && ` (×${item.quantity})`}
              </span>
              <span>${(item.amountCents / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-base font-semibold">
            <span>Total</span>
            <span>${(selected.totalCents / 100).toFixed(2)}</span>
          </div>

          {payments && payments.length > 0 && (
            <div className="space-y-2 pt-4">
              <p className="text-sm text-[#8b8b9c]">Payment attempts</p>
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#8b8b9c]">Attempt #{p.attemptNumber}</span>
                  <Badge className={paymentStatusStyles[p.status]}>{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
