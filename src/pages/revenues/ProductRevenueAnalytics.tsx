import React, { useEffect, useState } from 'react';
import { productRevenueApiService, ProductRevenueFilterRequest, ProductRevenue, ProductRevenueResponse } from '../../services/api/product-revenue.service';
import { categoriesApiService } from '../../services/api';
import { Category } from '../../models/Category';
import RevenueChart from '../../components/charts/RevenueChart';
import DailyRevenueChart from '../../components/charts/DailyRevenueChart';
import DailyTrendChart from '../../components/charts/DailyTrendChart';

const ProductRevenueAnalytics: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [revenueData, setRevenueData] = useState<ProductRevenueResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductRevenue | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy ngày đầu năm hiện tại
  const startOfYear = new Date();
  startOfYear.setMonth(0);
  startOfYear.setDate(1);
  
  // Filter states với giá trị mặc định
  const [filter, setFilter] = useState<ProductRevenueFilterRequest>({
    fromDate: startOfYear.toISOString().split('T')[0], // Ngày đầu năm hiện tại (YYYY-MM-DD)
    toDate: new Date().toISOString().split('T')[0], // Ngày hiện tại (YYYY-MM-DD)
    categoryId: ''
  });

  // State cho tab hiển thị
  const [activeTab, setActiveTab] = useState<'overview' | 'daily'>('overview');
  
  // State cho chế độ xem biểu đồ theo ngày
  const [viewMode, setViewMode] = useState<'all' | 'product'>('all');
  const [selectedProductForTrend, setSelectedProductForTrend] = useState<string | null>(null);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApiService.getActive();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch revenue data
  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);
    
    // Kiểm tra fromDate và toDate
    if (filter.fromDate && filter.toDate) {
      const fromDate = new Date(filter.fromDate);
      const toDate = new Date(filter.toDate);
      
      if (fromDate > toDate) {
        setError('Ngày bắt đầu không thể sau ngày kết thúc');
        setLoading(false);
        return;
      }
    }
    
    try {
      const data = await productRevenueApiService.getProductRevenueByFilter(filter);
      setRevenueData(data);
      setSelectedProduct(null); // Reset selected product when new data is fetched
      setSelectedProductForTrend(null); // Reset selected product for trend
    } catch (error: any) { // Sử dụng any tạm thời để xử lý lỗi
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      if (error && error.data && error.data.title) {
        setError(`Lỗi: ${error.data.title}`);
      } else if (error && error.message) {
        setError(`Lỗi: ${error.message}`);
      } else {
        setError('Đã xảy ra lỗi khi lấy dữ liệu doanh thu');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRevenueData();
  };
  
  // Handle product selection for detailed view
  const handleProductSelect = (product: ProductRevenue) => {
    setSelectedProduct(product);
    setActiveTab('overview');
  };
  
  // Handle product selection for trend chart
  const handleSelectProductForTrend = (productId: string) => {
    if (selectedProductForTrend === productId) {
      setSelectedProductForTrend(null);
      setViewMode('all');
    } else {
      setSelectedProductForTrend(productId);
      setViewMode('product');
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  // Format date - đảm bảo giá trị đầu vào không phải undefined
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  // Export to Excel
  const handleExport = async () => {
    try {
      const blob = await productRevenueApiService.exportProductRevenueToExcel(filter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DoanThuSanPham.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Lỗi khi xuất báo cáo:', error);
      setError('Đã xảy ra lỗi khi xuất báo cáo');
    }
  };
  
  // Lấy dữ liệu biểu đồ theo ngày
  const getDailyTrendData = () => {
    if (!revenueData) return [];
    
    if (viewMode === 'all') {
      // Gộp tất cả dữ liệu doanh thu theo ngày
      const allDailyRevenue = revenueData.products.flatMap(product => product.dailyRevenue);
      
      // Gộp dữ liệu theo ngày
      const dailyMap: Record<string, { totalRevenue: number, orderCount: number, quantitySold: number }> = {};
      
      allDailyRevenue.forEach(item => {
        const dateString = new Date(item.date).toISOString().split('T')[0];
        if (!dailyMap[dateString]) {
          dailyMap[dateString] = {
            totalRevenue: 0,
            orderCount: 0,
            quantitySold: 0
          };
        }
        
        dailyMap[dateString].totalRevenue += item.totalRevenue;
        dailyMap[dateString].orderCount += item.orderCount;
        dailyMap[dateString].quantitySold += item.quantitySold;
      });
      
      // Chuyển đổi lại thành mảng
      return Object.keys(dailyMap).map(dateKey => ({
        date: dateKey,
        totalRevenue: dailyMap[dateKey].totalRevenue,
        orderCount: dailyMap[dateKey].orderCount,
        quantitySold: dailyMap[dateKey].quantitySold
      }));
    } else {
      // Lấy dữ liệu doanh thu theo ngày của sản phẩm được chọn
      const selectedProduct = revenueData.products.find(p => p.productId === selectedProductForTrend);
      return selectedProduct ? selectedProduct.dailyRevenue : [];
    }
  };
  
  // Lấy tiêu đề cho biểu đồ theo ngày
  const getDailyTrendTitle = () => {
    if (viewMode === 'all') {
      return `Doanh thu theo ngày từ ${formatDate(filter.fromDate)} đến ${formatDate(filter.toDate)}`;
    } else {
      const product = revenueData?.products.find(p => p.productId === selectedProductForTrend);
      return `Doanh thu theo ngày - ${product?.productName || 'Sản phẩm'} (${formatDate(filter.fromDate)} - ${formatDate(filter.toDate)})`;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thống kê doanh thu sản phẩm</h1>
      
      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              name="fromDate"
              value={filter.fromDate || ''}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              name="toDate"
              value={filter.toDate || ''}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              name="categoryId"
              value={filter.categoryId || ''}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <div className="mt-4 p-2 border border-red-300 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleExport}
            disabled={!revenueData}
            className="bg-green-600 text-white px-4 py-2 rounded-md mr-2 disabled:bg-gray-400"
          >
            Xuất Excel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Lọc dữ liệu'}
          </button>
        </div>
      </form>
      
      {/* Summary Section */}
      {revenueData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-700">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueData.grandTotalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-700">Tổng đơn hàng</h3>
            <p className="text-2xl font-bold text-blue-600">{revenueData.grandTotalOrderCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-700">Tổng số lượng bán</h3>
            <p className="text-2xl font-bold text-purple-600">{revenueData.grandTotalQuantitySold}</p>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      {revenueData && revenueData.products.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button 
                className={`py-3 px-6 font-medium text-sm rounded-t-lg ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('overview')}
              >
                Tổng quan sản phẩm
              </button>
              <button 
                className={`py-3 px-6 font-medium text-sm rounded-t-lg ${activeTab === 'daily' ? 'bg-indigo-100 text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('daily')}
              >
                Doanh thu theo ngày
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Charts Section */}
      {revenueData && revenueData.products.length > 0 ? (
        <>
          {activeTab === 'overview' ? (
            <>
              {/* Overall Revenue Chart */}
              <RevenueChart 
                products={revenueData.products} 
                title={`Biểu đồ doanh thu sản phẩm ${formatDate(filter.fromDate)} - ${formatDate(filter.toDate)}`} 
              />
              
              {/* Product Table */}
              <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-xl font-semibold p-4 border-b">Chi tiết doanh thu sản phẩm</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng bán</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số đơn hàng</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData.products.map((product) => (
                        <tr key={product.productId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{product.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.productSku}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.categoryName}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">{formatCurrency(product.totalRevenue)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.totalQuantitySold}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.totalOrderCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleProductSelect(product)}
                              className="text-indigo-600 hover:text-indigo-900 mr-2"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                handleSelectProductForTrend(product.productId);
                                setActiveTab('daily');
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Xem biểu đồ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Daily Revenue Chart for Selected Product */}
              {selectedProduct && selectedProduct.dailyRevenue.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">Chi tiết doanh thu theo ngày - {selectedProduct.productName}</h2>
                  <DailyRevenueChart
                    dailyRevenue={selectedProduct.dailyRevenue}
                    productName={selectedProduct.productName}
                  />
                </div>
              )}
            </>
          ) : (
            /* Daily Trend Chart Tab */
            <div className="mt-6">
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{getDailyTrendTitle()}</h2>
                  <div>
                    <button
                      onClick={() => {
                        setViewMode('all');
                        setSelectedProductForTrend(null);
                      }}
                      className={`px-4 py-2 rounded-l-md ${viewMode === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => {
                        if (viewMode === 'all' && revenueData.products.length > 0) {
                          setSelectedProductForTrend(revenueData.products[0].productId);
                          setViewMode('product');
                        }
                      }}
                      className={`px-4 py-2 rounded-r-md ${viewMode === 'product' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      disabled={viewMode === 'product' || revenueData.products.length === 0}
                    >
                      Theo sản phẩm
                    </button>
                  </div>
                </div>
                
                {/* Product Selector for Trend Chart */}
                {viewMode === 'product' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn sản phẩm</label>
                    <select
                      value={selectedProductForTrend || ''}
                      onChange={(e) => setSelectedProductForTrend(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      {revenueData.products.map(product => (
                        <option key={product.productId} value={product.productId}>
                          {product.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Daily Trend Chart */}
                {filter.fromDate && filter.toDate && (
                  <DailyTrendChart
                    dailyRevenue={getDailyTrendData()}
                    startDate={new Date(filter.fromDate)}
                    endDate={new Date(filter.toDate)}
                    title={getDailyTrendTitle()}
                  />
                )}
              </div>
              
              {/* Product Selection List for Trend View */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-xl font-semibold p-4 border-b">Chọn sản phẩm để xem biểu đồ</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData.products.map((product) => (
                        <tr 
                          key={product.productId} 
                          className={`hover:bg-gray-50 ${selectedProductForTrend === product.productId ? 'bg-indigo-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">{product.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.categoryName}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">{formatCurrency(product.totalRevenue)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleSelectProductForTrend(product.productId)}
                              className={`px-4 py-1 rounded-md ${selectedProductForTrend === product.productId ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                              {selectedProductForTrend === product.productId ? 'Đang xem' : 'Xem biểu đồ'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          {loading ? (
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          ) : (
            revenueData ? (
              <p className="text-gray-600">Không có dữ liệu doanh thu cho khoảng thời gian và danh mục đã chọn.</p>
            ) : (
              <p className="text-gray-600">Vui lòng chọn khoảng thời gian và danh mục, sau đó nhấn "Lọc dữ liệu" để xem thống kê.</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ProductRevenueAnalytics; 