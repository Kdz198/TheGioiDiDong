/**
 * Formats any value into a human-readable string, avoiding raw JSON output like `{}`.
 *
 * - `null` / `undefined` → `"—"`
 * - `boolean` → `"Có"` (true) or `"Không"` (false)
 * - empty `string` → `"—"`
 * - `number` → numeric string
 * - `Array` → comma-separated formatted items
 * - `object` → `"key: value"` lines (no JSON braces)
 */
export function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Có" : "Không";
  if (typeof val === "string") return val.trim() === "" ? "—" : val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "—";
    return val.map((item) => formatValue(item)).join(", ");
  }
  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return "—";
    return entries.map(([k, v]) => `${k}: ${formatValue(v)}`).join("\n");
  }
  return String(val);
}
