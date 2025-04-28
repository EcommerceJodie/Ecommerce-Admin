import apiClient from '../http/api-client';
import { OrderFilterParams, OrdersResponse } from '../../models/Order';

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city?: string;
  country?: string;
  totalOrders?: number;
  lastOrderDate?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface OrderCreateRequest {
  customerId: string;
  phoneNumber: string;
  shippingAddress: string;
  note?: string;
  orderItems: OrderItem[];
}

export interface OrderCreateResponse {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: number;
  shippingAddress: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  paymentMethod: string;
  paymentTransactionId: string;
  paymentDate: string;
  shippingDate?: string;
  notes?: string;
  customerId: string;
  customerName: string;
  createdAt: string;
  orderDetails: OrderDetail[];
}

export interface OrderDetail {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  productId: string;
  productName: string;
  productImageUrl: string;
}

class OrdersApiService {
  private readonly baseEndpoint = '/api/admin/orders';

  public async searchCustomers(phoneNumber: string): Promise<Customer[]> {
    return apiClient.get<Customer[]>(`${this.baseEndpoint}/search-customers?phoneNumber=${phoneNumber}`);
  }

  public async createManualOrder(request: OrderCreateRequest): Promise<OrderCreateResponse> {
    console.log('Gọi API createManualOrder với:', request);
    try {
      const response = await apiClient.post<OrderCreateResponse>(`${this.baseEndpoint}`, request);
      console.log('Kết quả API:', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi gọi API createManualOrder:', error);
      throw error;
    }
  }

  public async getOrders(params: OrderFilterParams = {}): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('searchTerm', params.searchTerm || '');
    
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.isDescending !== undefined) queryParams.append('isDescending', params.isDescending.toString());
    
    const url = `${this.baseEndpoint}?${queryParams.toString()}`;
    return apiClient.get<OrdersResponse>(url);
  }
}

export const ordersApiService = new OrdersApiService(); 