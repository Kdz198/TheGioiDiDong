import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Address } from "@/interfaces/user.types";
import { MapPin, Pencil, Trash2 } from "lucide-react";

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AddressCard({ address, selected, onSelect, onEdit, onDelete }: AddressCardProps) {
  const fullAddress = `${address.streetAddress}, ${address.ward}, ${address.district}, ${address.province}`;

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-colors ${
        selected ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"
      } ${onSelect ? "cursor-pointer" : ""}`}
      onClick={onSelect}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 text-teal-500" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900">{address.recipientName}</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500">{address.phone}</span>
              {address.isDefault && (
                <Badge variant="outline" className="text-xs text-teal-500">
                  Mặc định
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{fullAddress}</p>
          </div>
        </div>

        <div className="flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}>
              <Pencil className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          )}
          {onDelete && !address.isDefault && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}>
              <Trash2 className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
