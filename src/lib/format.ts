const currencyFormatterCache = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currencyCode: string) {
  let formatter = currencyFormatterCache.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    });
    currencyFormatterCache.set(currencyCode, formatter);
  }
  return formatter;
}

export function formatCurrency(amount: number, currencyCode = "USD") {
  try {
    return getCurrencyFormatter(currencyCode).format(amount);
  } catch {
    // Unknown/invalid ISO currency code — fall back to a plain label.
    return `${amount.toLocaleString("en-US")} ${currencyCode}`;
  }
}

export function formatAmountRange(min: number, max: number, currencyCode = "USD") {
  if (min === max) return formatCurrency(min, currencyCode);
  return `${formatCurrency(min, currencyCode)} - ${formatCurrency(max, currencyCode)}`;
}

/** Server-side date formatting (e.g. for notification copy). Pass a
 * student's stored IANA timezone when available; UI rendering should use
 * the browser-side LocalDate/LocalDeadline components instead. */
export function formatDate(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(date);
}

export function daysUntil(date: Date) {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
