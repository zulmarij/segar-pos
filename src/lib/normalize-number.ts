export function normalizeNumber(value: unknown): number | null {
  if (value == null) return null;

  const str = String(value).trim();

  const cleaned = str.replace(/[.,\s]/g, "");

  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}
