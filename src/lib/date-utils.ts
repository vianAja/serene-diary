/**
 * Helper to get date string in YYYY-MM-DD format based on WIB (Asia/Jakarta) timezone.
 */
export function getJakartaDateString(date: Date = new Date()): string {
  try {
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
