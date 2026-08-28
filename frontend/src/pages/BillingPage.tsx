import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Receipt } from "lucide-react"
import { getInvoices, generateInvoice, payInvoice, getPayments, type Invoice } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const statusStyles: Record<string, string> = {
  PAID: "bg-[#34d399]/15 text-[#34d399]",
  SUCCEEDED: "bg-[#34d399]/15 text-[#34d399]",
  FAILED: "bg-[#f87171]/15 text-[#f87171]",
  PENDING: "bg-[#fbbf24]/15 text-[#fbbf24]",
}

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
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-[#8b8b9c] text-sm mt-1">Invoices and payment history for your organization.</p>
        </div>
        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? "Generating..." : "Generate Invoice (test)"}
        </Button>
      </div>

      <div className="space-y-3">
        {invoices?.length === 0 && (
          <Card className="flex flex-col items-center text-center py-10 space-y-2">
            <Receipt size={24} className="text-[#8b8b9c]" />
            <p className="text-sm text-[#8b8b9c]">No invoices yet — click "Generate Invoice" to create one.</p>
          </Card>
        )}
        {invoices?.map((invoice) => (
          <Card
            key={invoice.id}
            className="cursor-pointer hover:border-[#7c5cff]/50 transition-colors"
            onClick={() => setSelected(invoice)}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-[#8b8b9c]">
                  {new Date(invoice.periodStart).toLocaleDateString()} – {new Date(invoice.periodEnd).toLocaleDateString()}
                </p>
                <Badge className={statusStyles[invoice.status]}>{invoice.status}</Badge>
              </div>
              <div className="text-right space-y-2">
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
                    {payMutation.isPending ? "Charging..." : "Pay Now"}
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
            <h2 className="text-lg font-semibold">Invoice Detail</h2>
            <button onClick={() => setSelected(null)} className="text-[#8b8b9c] text-sm hover:text-white">
              Close
            </button>
          </div>

          {selected.lineItems.map((item, i) => (
            <div key={i} className="flex justify-between text-sm border-b border-[#24242f] py-2">
              <span className="text-[#8b8b9c]">
                {item.description}
                {item.quantity != null && ` (×${item.quantity})`}
              </span>
              <span>${(item.amountCents / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-semibold pt-2">
            <span>Total</span>
            <span>${(selected.totalCents / 100).toFixed(2)}</span>
          </div>

          {payments && payments.length > 0 && (
            <div className="pt-4 space-y-2">
              <p className="text-sm text-[#8b8b9c]">Payment attempts</p>
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm">
                  <span className="text-[#8b8b9c]">Attempt #{p.attemptNumber}</span>
                  <Badge className={statusStyles[p.status]}>{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}