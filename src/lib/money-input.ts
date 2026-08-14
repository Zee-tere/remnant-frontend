const MAX_MONEY_DIGITS = 12;

export function normalizeMoneyInput(value: string) {
  return value
    .replace(/,/g, "")
    .split(".")[0]
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, MAX_MONEY_DIGITS);
}

export function formatMoneyInput(value: string) {
  const normalized = normalizeMoneyInput(value);
  return normalized ? Number(normalized).toLocaleString("en-NG") : "";
}
