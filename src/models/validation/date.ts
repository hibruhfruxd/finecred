export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function transactionDateError(value: string): string | null {
  if (!isValidIsoDate(value)) {
    return "Enter a valid transaction date in YYYY-MM-DD format.";
  }
  if (value > todayIsoDate()) {
    return "Transaction date cannot be in the future.";
  }
  if (value < "2000-01-01") {
    return "Transaction date must be on or after 1 January 2000.";
  }
  return null;
}
