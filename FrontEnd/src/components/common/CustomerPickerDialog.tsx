import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { User } from "@/interfaces/user.types";
import { Check, Loader2, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

interface CustomerPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: User[];
  isLoading: boolean;
  selectedCustomerId: number | null;
  recentCustomerIds: number[];
  onSelectCustomer: (customerId: number) => void;
}

function CustomerListItem({
  customer,
  isSelected,
  onSelect,
}: {
  customer: User;
  isSelected: boolean;
  onSelect: (customerId: number) => void;
}) {
  return (
    <button
      type="button"
      className="w-full rounded-lg border border-gray-100 px-3 py-2 text-left transition-colors hover:border-teal-200 hover:bg-teal-50"
      onClick={() => onSelect(customer.id)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="line-clamp-1 text-sm font-medium text-zinc-900">{customer.fullName}</p>
          <p className="line-clamp-1 text-xs text-gray-500">{customer.email}</p>
        </div>
        {isSelected ? <Check className="mt-0.5 h-4 w-4 text-teal-600" /> : null}
      </div>
    </button>
  );
}

export function CustomerPickerDialog({
  open,
  onOpenChange,
  customers,
  isLoading,
  selectedCustomerId,
  recentCustomerIds,
  onSelectCustomer,
}: CustomerPickerDialogProps) {
  const [keyword, setKeyword] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return customers;

    return customers.filter((customer) => {
      const searchableText = `${customer.fullName} ${customer.email}`.toLowerCase();
      return searchableText.includes(normalizedKeyword);
    });
  }, [customers, keyword]);

  const recentCustomers = useMemo(() => {
    if (!recentCustomerIds.length) return [];

    const userMap = new Map(customers.map((customer) => [customer.id, customer]));
    return recentCustomerIds
      .map((customerId) => userMap.get(customerId))
      .filter((customer): customer is User => Boolean(customer));
  }, [customers, recentCustomerIds]);

  const selectAndClose = (customerId: number) => {
    onSelectCustomer(customerId);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setKeyword("");
        }
      }}>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Chọn khách hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên hoặc email"
              className="pl-9"
            />
          </div>

          {recentCustomers.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Gần đây</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {recentCustomers.map((customer) => (
                  <CustomerListItem
                    key={`recent-${customer.id}`}
                    customer={customer}
                    isSelected={selectedCustomerId === customer.id}
                    onSelect={selectAndClose}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Danh sách khách hàng</span>
              <span>{filteredCustomers.length} kết quả</span>
            </div>

            <div className="max-h-[48vh] space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/60 p-2">
              {isLoading ? (
                <div className="flex h-24 items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải khách hàng...
                </div>
              ) : null}

              {!isLoading && filteredCustomers.length === 0 ? (
                <div className="flex h-24 items-center justify-center gap-2 text-sm text-gray-500">
                  <UserRound className="h-4 w-4" />
                  Không tìm thấy khách hàng phù hợp
                </div>
              ) : null}

              {!isLoading
                ? filteredCustomers.map((customer) => (
                    <CustomerListItem
                      key={customer.id}
                      customer={customer}
                      isSelected={selectedCustomerId === customer.id}
                      onSelect={selectAndClose}
                    />
                  ))
                : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
