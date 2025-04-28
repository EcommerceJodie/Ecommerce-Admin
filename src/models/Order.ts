export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  note: string;
}

export interface OrdersResponse {
  orders: Order[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderFilterParams {
  pageNumber?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  searchTerm?: string;
  sortBy?: string;
  isDescending?: boolean;
}

export enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5,
  Returned = 6,
  Refunded = 7
}

export enum SortByOption {
  CreatedAt = "CreatedAt",
  OrderNumber = "OrderNumber",
  CustomerName = "CustomerName",
  TotalAmount = "TotalAmount"
}

// Hàm chuyển đổi giá trị số thành tên trạng thái
export const getOrderStatusName = (statusCode: number): string => {
  switch (statusCode) {
    case OrderStatus.Pending:
      return "Chờ xử lý";
    case OrderStatus.Processing:
      return "Đang xử lý";
    case OrderStatus.Shipped:
      return "Đã giao cho vận chuyển";
    case OrderStatus.Delivered:
      return "Đã giao hàng";
    case OrderStatus.Cancelled:
      return "Đã hủy";
    case OrderStatus.Returned:
      return "Đã trả hàng";
    case OrderStatus.Refunded:
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
}; 