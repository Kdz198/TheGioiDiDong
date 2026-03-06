import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Voucher } from "@/interfaces/promotion.types";
import { Loader2, Tag, X } from "lucide-react";
import { useState } from "react";

interface VoucherInputProps {
  onApply: (code: string) => void;
  isLoading: boolean;
  appliedVoucher?: Voucher | null;
  onRemove?: () => void;
}

export function VoucherInput({ onApply, isLoading, appliedVoucher, onRemove }: VoucherInputProps) {
  const [code, setCode] = useState("");

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
    }
  };

  if (appliedVoucher) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 p-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-teal-500" />
          <span className="text-sm font-medium text-teal-700">{appliedVoucher.code}</span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Nhập mã giảm giá"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
      />
      <Button
        onClick={handleApply}
        disabled={isLoading || !code.trim()}
        className="bg-teal-500 hover:bg-teal-600">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
      </Button>
    </div>
  );
}
