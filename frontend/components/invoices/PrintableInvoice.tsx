import type { InvoiceDetail } from "@/types/invoice.types";
import type { CompanySettings } from "@/types/company-settings.types";

interface PrintableInvoiceProps {
  invoice: InvoiceDetail;
  company: CompanySettings | null;
  dateLocale: string;
}

function formatMoney(
  amount: string | number,
  currency: string,
  locale: string,
) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    num,
  );
}

// Rendered off-screen; only shown via print:block when the user hits Print.
export function PrintableInvoice({
  invoice,
  company,
  dateLocale,
}: PrintableInvoiceProps) {
  const currency = company?.currency ?? "EGP";

  return (
    <div className="hidden print:block p-10 text-slate-900">
      <div className="flex items-start justify-between border-b border-slate-300 pb-6">
        <div className="flex items-center gap-3">
          {company?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt=""
              className="h-14 w-14 object-contain"
            />
          ) : null}
          <div>
            <p className="text-lg font-bold">{company?.name ?? "ERP Lite"}</p>
            {company?.address ? (
              <p className="mt-1 max-w-xs text-xs text-slate-600 whitespace-pre-line">
                {company.address}
              </p>
            ) : null}
            {company?.taxNumber ? (
              <p className="mt-1 text-xs text-slate-600">
                Tax No: {company.taxNumber}
              </p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">
            {(company?.invoicePrefix ?? "INV-") + invoice.invoiceNumber}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {new Date(invoice.createdAt).toLocaleDateString(dateLocale)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Bill to
          </p>
          <p className="mt-1 font-medium">{invoice.salesOrder.customer.name}</p>
          {invoice.salesOrder.customer.email ? (
            <p className="text-xs text-slate-600">
              {invoice.salesOrder.customer.email}
            </p>
          ) : null}
          {invoice.salesOrder.customer.phone ? (
            <p className="text-xs text-slate-600">
              {invoice.salesOrder.customer.phone}
            </p>
          ) : null}
        </div>
        {company?.paymentTerms ? (
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Payment terms
            </p>
            <p className="mt-1 text-sm">{company.paymentTerms}</p>
          </div>
        ) : null}
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2 font-semibold">Product</th>
            <th className="py-2 font-semibold">SKU</th>
            <th className="py-2 font-semibold">Qty</th>
            <th className="py-2 font-semibold">Price</th>
            <th className="py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.salesOrder.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2">{item.product.name}</td>
              <td className="py-2 text-slate-600">{item.product.sku}</td>
              <td className="py-2 text-slate-600">{item.quantity}</td>
              <td className="py-2 text-slate-600">
                {formatMoney(item.unitPrice, currency, dateLocale)}
              </td>
              <td className="py-2 text-right">
                {formatMoney(
                  parseFloat(item.unitPrice) * item.quantity,
                  currency,
                  dateLocale,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-56 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Total</span>
            <span className="font-semibold">
              {formatMoney(invoice.amount, currency, dateLocale)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Paid</span>
            <span>{formatMoney(invoice.amountPaid, currency, dateLocale)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-1 font-semibold">
            <span>Balance due</span>
            <span>
              {formatMoney(
                parseFloat(invoice.amount) - parseFloat(invoice.amountPaid),
                currency,
                dateLocale,
              )}
            </span>
          </div>
        </div>
      </div>

      {company?.invoiceFooterNote ? (
        <p className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500 whitespace-pre-line">
          {company.invoiceFooterNote}
        </p>
      ) : null}
    </div>
  );
}
