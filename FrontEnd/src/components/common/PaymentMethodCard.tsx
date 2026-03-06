import type { PaymentMethod } from "@/interfaces/order.types";
import { Banknote, CreditCard, Wallet } from "lucide-react";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

const methodConfig: Record<
  PaymentMethod,
  { label: string; description: string; icon: React.ReactNode }
> = {
  momo: {
    label: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: <Wallet className="h-5 w-5 text-pink-500" />,
  },
  vnpay: {
    label: "VNPay",
    description: "Thanh toán qua VNPay (ATM/Visa/Master)",
    icon: <CreditCard className="h-5 w-5 text-blue-500" />,
  },
  cod: {
    label: "Thanh toán khi nhận hàng",
    description: "Thanh toán bằng tiền mặt khi nhận hàng (COD)",
    icon: <Banknote className="h-5 w-5 text-green-600" />,
  },
};

export function PaymentMethodCard({ method, selected, onSelect }: PaymentMethodCardProps) {
  const config = methodConfig[method];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
        selected ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
      }`}>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          selected ? "bg-teal-100" : "bg-gray-100"
        }`}>
        {config.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900">{config.label}</p>
        <p className="text-xs text-gray-500">{config.description}</p>
      </div>
      <div
        className={`h-5 w-5 rounded-full border-2 ${
          selected ? "border-teal-500 bg-teal-500" : "border-gray-300"
        }`}>
        {selected && (
          <div className="flex h-full items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        )}
      </div>
    </button>
  );
}
