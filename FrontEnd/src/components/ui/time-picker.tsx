import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimeValue {
  hour: number;
  minute: number;
}

interface TimePickerProps {
  value: TimeValue | undefined;
  onChange: (v: TimeValue) => void;
  minuteStep?: number;
  className?: string;
}

export function TimePicker({ value, onChange, minuteStep = 1, className }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  const currentHour = value?.hour ?? 0;
  const currentMinute = value?.minute ?? 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={String(currentHour)}
        onValueChange={(v) => onChange({ hour: Number(v), minute: currentMinute })}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {String(h).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm font-medium">:</span>
      <Select
        value={String(currentMinute)}
        onValueChange={(v) => onChange({ hour: currentHour, minute: Number(v) })}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {String(m).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
