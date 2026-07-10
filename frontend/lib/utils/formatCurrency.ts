export function formatCurrency(amount: string | number, dateLocale: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(dateLocale, {
    style: "currency",
    currency: "EGP",
  }).format(num);
}
