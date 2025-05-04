import apiClient from '../http/api-client';
import { Customer, CustomerResponse, CustomerFilterParams } from '../../models/Customer';

class CustomersApiService {
  private readonly baseEndpoint = '/api/customers';
  
  public async getAll(params: CustomerFilterParams = {}): Promise<CustomerResponse> {
    const apiParams: Record<string, string> = {
      City: 'all',
      Country: 'all',
    };
    
    if (params.pageNumber) apiParams.PageNumber = String(params.pageNumber);
    if (params.pageSize) apiParams.PageSize = String(params.pageSize);
    if (params.sortBy) apiParams.SortBy = params.sortBy;
    if (params.sortDesc !== undefined) apiParams.SortDesc = String(params.sortDesc);
    if (params.searchTerm) apiParams.SearchTerm = params.searchTerm;
    if (params.isActive !== undefined) apiParams.IsActive = String(params.isActive);
    
    if (params.city) apiParams.City = params.city;
    if (params.country) apiParams.Country = params.country;
    
    console.log('API params:', apiParams);
    return apiClient.get<CustomerResponse>(this.baseEndpoint, apiParams);
  }
  
  public async getById(id: string): Promise<Customer> {
    return apiClient.get<Customer>(`${this.baseEndpoint}/${id}`);
  }
  
  public async getByUserId(userId: string): Promise<Customer> {
    return apiClient.get<Customer>(`${this.baseEndpoint}/by-user/${userId}`);
  }
  
  public async updateStatus(id: string, isActive: boolean): Promise<void> {
    return apiClient.put<void>(`${this.baseEndpoint}/${id}/status`, { isActive });
  }
}

export const customersApiService = new CustomersApiService(); 