export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  dateOfBirth: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
}

export interface CustomerResponse {
  items: Customer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomerFilterParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  searchTerm?: string;
  isActive?: boolean;
  country?: string;
  city?: string;
} 