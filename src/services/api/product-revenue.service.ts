import apiClient from '../http/api-client';

export interface ProductRevenueFilterRequest {
  fromDate?: string;
  toDate?: string;
  categoryId?: string | null;
}

export interface DailyRevenue {
  date: string;
  totalRevenue: number;
  orderCount: number;
  quantitySold: number;
}

export interface ProductRevenue {
  productId: string;
  productName: string;
  productSku: string;
  categoryName: string;
  totalRevenue: number;
  totalQuantitySold: number;
  totalOrderCount: number;
  dailyRevenue: DailyRevenue[];
}

export interface ProductRevenueResponse {
  products: ProductRevenue[];
  grandTotalRevenue: number;
  grandTotalQuantitySold: number;
  grandTotalOrderCount: number;
}

class ProductRevenueApiService {
  private readonly baseEndpoint = '/api/ProductRevenue';
  
  /**
   * Lấy thống kê doanh thu sản phẩm theo bộ lọc
   * @param filter Tham số lọc: khoảng thời gian, danh mục
   * @returns Dữ liệu thống kê doanh thu sản phẩm
   */
  public async getProductRevenueByFilter(filter: ProductRevenueFilterRequest): Promise<ProductRevenueResponse> {
    // Tạo một bản sao của filter để xử lý categoryId
    const cleanedFilter = { ...filter };
    
    // Nếu categoryId rỗng, đặt nó thành null để tránh lỗi chuyển đổi Guid
    if (cleanedFilter.categoryId === '') {
      cleanedFilter.categoryId = null;
    }
    
    // Đóng gói dữ liệu trong đối tượng queryDto theo yêu cầu của API
    return apiClient.post<ProductRevenueResponse>(`${this.baseEndpoint}/filter`, { queryDto: cleanedFilter });
  }
  
  /**
   * Xuất báo cáo doanh thu sản phẩm theo định dạng Excel
   * @param filter Tham số lọc: khoảng thời gian, danh mục
   * @returns Blob chứa file Excel
   */
  public async exportProductRevenueToExcel(filter: ProductRevenueFilterRequest): Promise<Blob> {
    // Tạo một bản sao của filter để xử lý categoryId
    const cleanedFilter = { ...filter };
    
    // Nếu categoryId rỗng, đặt nó thành null để tránh lỗi chuyển đổi Guid
    if (cleanedFilter.categoryId === '') {
      cleanedFilter.categoryId = null;
    }
    
    // URL cho tệp xuất Excel cần phải sử dụng query params thay vì JSON body
    return apiClient.downloadFile(`${this.baseEndpoint}/export?${this.buildQueryString(cleanedFilter)}`);
  }
  
  /**
   * Tạo chuỗi query từ đối tượng filter
   * @param filter Đối tượng filter
   * @returns Chuỗi query params
   */
  private buildQueryString(filter: ProductRevenueFilterRequest): string {
    const params = new URLSearchParams();
    
    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);
    if (filter.categoryId) params.append('categoryId', filter.categoryId);
    
    return params.toString();
  }
}

export const productRevenueApiService = new ProductRevenueApiService(); 