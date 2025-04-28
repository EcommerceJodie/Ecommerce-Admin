import { Customer } from '../services/api/orders.service';

export interface CustomerFormData {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderState {
  form: any;
  phoneNumber: string;
  customers: Customer[];
  loading: boolean;
  selectedCustomer: Customer | null;
  step: number;
  
  // Bước 2
  searchTerm: string;
  products: any[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  loadingProducts: boolean;
  selectedProducts: OrderItem[];
  totalAmount: number;
  
  // Bước 3
  note: string;
  creatingOrder: boolean;
  orderResponse: any | null;
  orderSuccess: boolean;
} 