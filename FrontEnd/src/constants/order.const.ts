export const ORDER_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELED", label: "Đã hủy" },
] as const;

export const ORDER_STATUS_UPDATE_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELED", label: "Đã hủy" },
] as const;
