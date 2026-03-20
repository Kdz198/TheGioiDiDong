import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Product } from "@/interfaces/product.types";
import { formatVND } from "@/utils/formatPrice";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface PickerSelection {
  productId: number;
  quantity: number;
}

interface ProductPickerDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  products: Product[];
  isLoading?: boolean;
  existingQuantities?: Record<number, number>;
  onConfirm: (_selections: PickerSelection[]) => void;
}

export function ProductPickerDialog({
  open,
  onOpenChange,
  products,
  isLoading = false,
  existingQuantities = {},
  onConfirm,
}: ProductPickerDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [draftSelections, setDraftSelections] = useState<Record<number, number>>({});

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setKeyword("");
      setDraftSelections({});
    }
    onOpenChange(nextOpen);
  };

  const filteredProducts = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => product.name.toLowerCase().includes(normalized));
  }, [keyword, products]);

  const selectedCount = useMemo(() => Object.keys(draftSelections).length, [draftSelections]);
  const selectedSubtotal = useMemo(
    () =>
      Object.entries(draftSelections).reduce((sum, [productIdText, quantity]) => {
        const productId = Number(productIdText);
        const product = products.find((item) => item.id === productId);
        if (!product) return sum;
        return sum + product.defaultPrice * quantity;
      }, 0),
    [draftSelections, products]
  );
  const resultCountText = `${filteredProducts.length} sản phẩm`;

  const toggleSelection = (product: Product) => {
    const stock = product.stockQuantity ?? 0;
    if (stock <= 0) return;

    setDraftSelections((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = 1;
      }
      return next;
    });
  };

  const updateQuantity = (product: Product, value: string) => {
    const stock = product.stockQuantity ?? 0;
    if (stock <= 0) return;

    const parsed = Number.parseInt(value, 10);
    const nextQty = Number.isFinite(parsed) ? Math.max(1, Math.min(parsed, stock)) : 1;
    setDraftSelections((prev) => ({ ...prev, [product.id]: nextQty }));
  };

  const canConfirm = selectedCount > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-gray-100 px-5 pt-5 pb-4">
          <DialogTitle>Chọn sản phẩm</DialogTitle>
          <p className="text-sm text-gray-500">
            Tìm kiếm và xác nhận sản phẩm trước khi thêm vào đơn
          </p>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm sản phẩm theo tên"
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Kết quả: {resultCountText}</span>
            {selectedCount > 0 ? (
              <span>
                Đã chọn: <span className="font-medium text-teal-700">{selectedCount} sản phẩm</span>
              </span>
            ) : (
              <span>Chưa chọn sản phẩm</span>
            )}
          </div>

          <div className="max-h-[50vh] overflow-auto rounded-lg border border-gray-100 bg-white">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-12 animate-pulse rounded-md bg-gray-100" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">Không tìm thấy sản phẩm</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-left text-gray-500">
                  <tr className="border-b border-gray-100">
                    <th className="w-10 px-3 py-2 text-center font-medium">Chọn</th>
                    <th className="px-3 py-2 font-medium">Sản phẩm</th>
                    <th className="w-36 px-3 py-2 text-right font-medium">Giá</th>
                    <th className="w-28 px-3 py-2 text-right font-medium">Tồn kho</th>
                    <th className="w-28 px-3 py-2 text-center font-medium">Trạng thái</th>
                    <th className="w-24 px-3 py-2 text-right font-medium">SL</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stock = product.stockQuantity ?? 0;
                    const selected = !!draftSelections[product.id];
                    const selectedQty = draftSelections[product.id] ?? 1;
                    const inStock = stock > 0;
                    const existedQty = existingQuantities[product.id] ?? 0;

                    return (
                      <tr
                        key={product.id}
                        className={`cursor-pointer border-b border-gray-100 last:border-0 ${
                          selected ? "bg-teal-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleSelection(product)}>
                        <td className="px-3 py-2 text-center">
                          <Checkbox
                            checked={selected}
                            disabled={!inStock}
                            onCheckedChange={() => toggleSelection(product)}
                            onClick={(event) => event.stopPropagation()}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <p className="line-clamp-1 font-medium text-zinc-900">{product.name}</p>
                          {existedQty > 0 && (
                            <p className="mt-0.5 text-xs text-teal-600">
                              Đã có trong đơn: {existedQty}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-zinc-900">
                          {formatVND(product.defaultPrice)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{stock}</td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                            }`}>
                            {inStock ? "Còn hàng" : "Hết hàng"}
                          </span>
                        </td>
                        <td
                          className="px-3 py-2 text-right"
                          onClick={(event) => event.stopPropagation()}>
                          <Input
                            type="number"
                            min={1}
                            max={stock}
                            disabled={!selected || !inStock}
                            value={selected ? selectedQty : ""}
                            onChange={(event) => updateQuantity(product, event.target.value)}
                            className="ml-auto h-8 w-20 text-right"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {selectedCount > 0 ? (
              <>
                Đã chọn <span className="font-semibold text-zinc-900">{selectedCount}</span> sản
                phẩm • Tạm tính{" "}
                <span className="font-semibold text-teal-700"> {formatVND(selectedSubtotal)}</span>
              </>
            ) : (
              "Chọn sản phẩm và số lượng ngay trong bảng, sau đó bấm Xác nhận chọn."
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              className="bg-teal-500 hover:bg-teal-600"
              disabled={!canConfirm}
              onClick={() => {
                const selections = Object.entries(draftSelections).map(
                  ([productIdText, quantity]) => ({
                    productId: Number(productIdText),
                    quantity,
                  })
                );
                onConfirm(selections);
                onOpenChange(false);
              }}>
              Xác nhận chọn ({selectedCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
