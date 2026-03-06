import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: vi,
  });
}
