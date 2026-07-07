export function formatDashboardCurrency(
  amount: number,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDashboardNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}
