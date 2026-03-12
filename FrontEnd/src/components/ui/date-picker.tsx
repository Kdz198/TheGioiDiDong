"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

type DatePickerMode = "date" | "datetime" | "month" | "year" | "time";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  mode?: DatePickerMode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

function formatValue(date: Date | undefined, mode: DatePickerMode): string {
  if (!date) return "";
  switch (mode) {
    case "date":
      return format(date, "dd/MM/yyyy", { locale: vi });
    case "datetime":
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    case "month":
      return format(date, "MM/yyyy", { locale: vi });
    case "year":
      return format(date, "yyyy");
    case "time":
      return format(date, "HH:mm");
  }
}

export function DatePicker({
  value,
  onChange,
  mode = "date",
  placeholder,
  disabled,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState(
    () => value?.getFullYear() ?? new Date().getFullYear()
  );
  const [viewDecade, setViewDecade] = React.useState(() => {
    const y = value?.getFullYear() ?? new Date().getFullYear();
    return Math.floor(y / 10) * 10;
  });

  const displayText = value ? formatValue(value, mode) : (placeholder ?? "Chọn ngày");

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    if (mode === "date") {
      onChange(day);
      setOpen(false);
    } else if (mode === "datetime") {
      const prev = value ?? new Date();
      const merged = new Date(day);
      merged.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
      onChange(merged);
    }
  };

  const handleTimeChange = (h: number, m: number) => {
    const base = value ? new Date(value) : new Date();
    base.setHours(h, m, 0, 0);
    onChange(base);
  };

  const handleMonthSelect = (month: number) => {
    const d = new Date(viewYear, month, 1);
    onChange(d);
    setOpen(false);
  };

  const handleYearSelect = (year: number) => {
    const d = new Date(year, value?.getMonth() ?? 0, 1);
    onChange(d);
    setOpen(false);
  };

  const MONTH_NAMES_VI = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}>
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === "time" && (
          <div className="p-3">
            <p className="mb-2 text-sm font-medium">Chọn giờ</p>
            <TimePicker
              value={value ? { hour: value.getHours(), minute: value.getMinutes() } : undefined}
              onChange={({ hour, minute }) => {
                handleTimeChange(hour, minute);
                setOpen(false);
              }}
            />
          </div>
        )}

        {(mode === "date" || mode === "datetime") && (
          <div>
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDaySelect}
              disabled={(day) => {
                if (minDate && day < minDate) return true;
                if (maxDate && day > maxDate) return true;
                return false;
              }}
              locale={vi}
            />
            {mode === "datetime" && (
              <div className="border-t p-3">
                <p className="mb-2 text-sm font-medium">Chọn giờ</p>
                <TimePicker
                  value={value ? { hour: value.getHours(), minute: value.getMinutes() } : undefined}
                  onChange={({ hour, minute }) => handleTimeChange(hour, minute)}
                />
                <div className="mt-3 flex justify-end">
                  <Button size="sm" onClick={() => setOpen(false)}>
                    Xác nhận
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "month" && (
          <div className="p-3" style={{ width: 280 }}>
            <div className="mb-3 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setViewYear((y) => y - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{viewYear}</span>
              <Button variant="ghost" size="icon" onClick={() => setViewYear((y) => y + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTH_NAMES_VI.map((name, i) => {
                const isSelected =
                  value && value.getMonth() === i && value.getFullYear() === viewYear;
                return (
                  <Button
                    key={i}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleMonthSelect(i)}>
                    {name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {mode === "year" && (
          <div className="p-3" style={{ width: 240 }}>
            <div className="mb-3 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setViewDecade((d) => d - 10)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {viewDecade}–{viewDecade + 9}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setViewDecade((d) => d + 10)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 10 }, (_, i) => viewDecade + i).map((year) => {
                const isSelected = value?.getFullYear() === year;
                return (
                  <Button
                    key={year}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleYearSelect(year)}>
                    {year}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
