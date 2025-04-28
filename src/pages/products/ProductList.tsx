import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiCopy } from 'react-icons/fi';
import { productsApiService, ProductQueryParams, PagedResult } from '../../services/api/products.service';
import { categoriesApiService } from '../../services/api/categories.service';
import { Product } from '../../models/Product';
import { productRevenueApiService, ProductRevenue } from '../../services/api/product-revenue.service';

interface Category {
  id: string;
  categoryName: string;
}

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10'));
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSalesData, setProductSalesData] = useState<Record<string, number>>({});
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    pageNumber: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('size') || '10'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortDesc: searchParams.get('sortDesc') === 'true',
    categoryId: searchParams.get('categoryId') || undefined,
    status: searchParams.get('status') || undefined,
    isFeatured: searchParams.get('isFeatured') ? searchParams.get('isFeatured') === 'true' : undefined,
    searchTerm: searchParams.get('search') || undefined
  });
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [productToDuplicate, setProductToDuplicate] = useState<Product | null>(null);
  const [duplicateFormData, setDuplicateFormData] = useState({
    NewProductName: '',
    NewProductSku: '',
    NewProductSlug: ''
  });
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Lấy danh sách danh mục
  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoriesApiService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Lấy dữ liệu doanh thu sản phẩm
  const fetchProductsSalesData = useCallback(async () => {
    try {
      // Lấy dữ liệu doanh thu từ đầu năm đến hiện tại
      const startOfYear = new Date();
      startOfYear.setMonth(0);
      startOfYear.setDate(1);
      
      const revenueData = await productRevenueApiService.getProductRevenueByFilter({
        fromDate: startOfYear.toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
      });
      
      // Tạo map sản phẩm và số lượng đã bán
      const salesMap: Record<string, number> = {};
      revenueData.products.forEach((product: ProductRevenue) => {
        salesMap[product.productId] = product.totalQuantitySold;
      });
      
      setProductSalesData(salesMap);
    } catch (err) {
      console.error('Error fetching product sales data:', err);
    }
  }, []);

  // Cập nhật URL khi tham số truy vấn thay đổi
  useEffect(() => {
    const params: Record<string, string> = {
      page: String(queryParams.pageNumber || 1),
      size: String(queryParams.pageSize || 10),
      sortBy: queryParams.sortBy || 'createdAt',
      sortDesc: String(queryParams.sortDesc ?? true)
    };
    
    if (queryParams.searchTerm) params.search = queryParams.searchTerm;
    if (queryParams.categoryId) params.categoryId = queryParams.categoryId;
    if (queryParams.status) params.status = queryParams.status;
    if (queryParams.isFeatured !== undefined) params.isFeatured = String(queryParams.isFeatured);
    
    setSearchParams(params);
  }, [queryParams, setSearchParams]);

  // Sử dụng API phân trang để lấy sản phẩm
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sử dụng API phân trang
      const result: PagedResult<Product> = await productsApiService.getPagedProducts(queryParams);
      
      setProducts(result.items);
      setTotalItems(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.pageNumber);
      setPageSize(result.pageSize);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProductsSalesData();
  }, [fetchProducts, fetchCategories, fetchProductsSalesData]);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productsApiService.delete(id);
        fetchProducts();
      } catch (err) {
        setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, pageNumber: page }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryParams(prev => ({ 
      ...prev, 
      pageNumber: 1,
      searchTerm: searchTerm || undefined
    }));
  };

  const handleFilterChange = (name: string, value: any) => {
    setQueryParams(prev => ({ ...prev, [name]: value, pageNumber: 1 }));
  };

  const handleSortChange = (field: string) => {
    setQueryParams(prev => ({
      ...prev,
      sortBy: field,
      sortDesc: prev.sortBy === field ? !prev.sortDesc : false,
      pageNumber: 1
    }));
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(id)) {
        return prev.filter(productId => productId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedProducts.length} sản phẩm đã chọn?`)) {
      try {
        await productsApiService.batchDelete(selectedProducts);
        setSelectedProducts([]);
        fetchProducts();
      } catch (err) {
        setError('Không thể xóa các sản phẩm đã chọn. Vui lòng thử lại sau.');
        console.error('Error deleting products:', err);
      }
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      // Tải thông tin sản phẩm để người dùng có thể tham khảo khi nhập thông tin mới
      const product = await productsApiService.getById(id);
      
      setProductToDuplicate(product);
      setDuplicateFormData({
        NewProductName: `${product.productName} - Bản sao`,
        NewProductSku: `${product.productSku}-COPY`,
        NewProductSlug: product.productSlug ? `${product.productSlug}-copy` : ``
      });
      setIsDuplicating(true);
      setDuplicateError(null);
    } catch (err) {
      console.error('Error loading product for duplication:', err);
      setError('Không thể tải thông tin sản phẩm để nhân bản.');
    }
  };
  
  const handleDuplicateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDuplicateFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDuplicateFormSubmit = async () => {
    if (!productToDuplicate) return;
    
    // Kiểm tra dữ liệu nhập vào
    if (!duplicateFormData.NewProductName.trim()) {
      setDuplicateError('Vui lòng nhập tên sản phẩm mới');
      return;
    }
    
    if (!duplicateFormData.NewProductSku.trim()) {
      setDuplicateError('Vui lòng nhập mã SKU mới');
      return;
    }
    
    if (!duplicateFormData.NewProductSlug.trim()) {
      setDuplicateError('Vui lòng nhập slug mới');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const duplicatedProduct = await productsApiService.duplicateProduct(
        productToDuplicate.id,
        duplicateFormData
      );
      
      setIsLoading(false);
      setIsDuplicating(false);
      setProductToDuplicate(null);
      
      // Nếu thành công, hiển thị thông báo và làm mới danh sách
      alert(`Đã nhân bản thành công sản phẩm thành: ${duplicatedProduct.productName}`);
      fetchProducts();
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        setDuplicateError(err.message);
      } else {
        setDuplicateError('Không thể nhân bản sản phẩm. Vui lòng thử lại sau.');
      }
      console.error('Error duplicating product:', err);
    }
  };
  
  const handleCancelDuplicate = () => {
    setIsDuplicating(false);
    setProductToDuplicate(null);
    setDuplicateError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Modal nhân bản sản phẩm */}
      {isDuplicating && productToDuplicate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nhân bản sản phẩm</h2>
            <p className="text-gray-600 mb-4">
              Bạn đang nhân bản sản phẩm: <span className="font-medium">{productToDuplicate.productName}</span>
            </p>
            
            {duplicateError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md">
                {duplicateError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="NewProductName"
                  value={duplicateFormData.NewProductName}
                  onChange={handleDuplicateFormChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã SKU mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="NewProductSku"
                  value={duplicateFormData.NewProductSku}
                  onChange={handleDuplicateFormChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="NewProductSlug"
                  value={duplicateFormData.NewProductSlug}
                  onChange={handleDuplicateFormChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCancelDuplicate}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDuplicateFormSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Nhân bản'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <div className="flex space-x-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md inline-flex items-center transition-colors duration-300"
            >
              <FiTrash2 className="mr-2" /> Xóa ({selectedProducts.length})
            </button>
          )}
          <Link
            to="/products/create"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-flex items-center transition-colors duration-300"
          >
            <FiPlus className="mr-2" /> Thêm sản phẩm
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full py-2 pl-10 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <button 
              type="submit" 
              className="absolute right-2 top-1.5 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
            >
              Tìm
            </button>
          </form>
          
          <button
            className="ml-3 flex items-center text-sm text-gray-600 hover:text-blue-600"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="mr-1" /> Bộ lọc
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Active">Đang hoạt động</option>
                  <option value="Inactive">Ngừng hoạt động</option>
                  <option value="Draft">Nháp</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm nổi bật</label>
                <select
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('isFeatured', value ? value === 'true' : undefined);
                  }}
                >
                  <option value="">Tất cả</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={products.length > 0 && selectedProducts.length === products.length}
                      onChange={handleSelectAllProducts}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('productName')}>
                    Sản phẩm {queryParams.sortBy === 'productName' && (queryParams.sortDesc ? '▼' : '▲')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('productPrice')}>
                    Giá {queryParams.sortBy === 'productPrice' && (queryParams.sortDesc ? '▼' : '▲')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('productStock')}>
                    Tồn kho {queryParams.sortBy === 'productStock' && (queryParams.sortDesc ? '▼' : '▲')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã bán
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="bg-white">
                      <td className="px-2 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                              <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrls[0]} alt={product.productName} />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                            <div className="text-sm text-gray-500">SKU: {product.productSku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.productDiscountPrice?.toLocaleString('vi-VN')} ₫</div>
                        {product.productPrice && (
                          <div className="text-xs text-gray-500 line-through">{product.productPrice.toLocaleString('vi-VN')} ₫</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.productStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{productSalesData[product.id] || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.categoryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Chỉnh sửa"
                        >
                          <FiEdit className="inline" />
                        </Link>
                        <button
                          onClick={() => handleDuplicateProduct(product.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Nhân bản sản phẩm"
                        >
                          <FiCopy className="inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <FiTrash2 className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> trong{' '}
                <span className="font-medium">{totalItems}</span> sản phẩm
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Hiển thị 5 trang xung quanh trang hiện tại
                  let pageToShow = currentPage;
                  if (currentPage < 3) {
                    pageToShow = i + 1;
                  } else if (currentPage > totalPages - 2) {
                    pageToShow = totalPages - 4 + i;
                  } else {
                    pageToShow = currentPage - 2 + i;
                  }
                  
                  // Đảm bảo trang hiển thị nằm trong phạm vi hợp lệ
                  if (pageToShow > 0 && pageToShow <= totalPages) {
                    return (
                      <button
                        key={pageToShow}
                        onClick={() => handlePageChange(pageToShow)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === pageToShow
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageToShow}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Tiếp
                </button>
              </div>
              
              <div className="text-sm">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newPageSize = Number(e.target.value);
                    setPageSize(newPageSize);
                    setQueryParams(prev => ({ ...prev, pageSize: newPageSize, pageNumber: 1 }));
                  }}
                  className="border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="5">5 / trang</option>
                  <option value="10">10 / trang</option>
                  <option value="20">20 / trang</option>
                  <option value="50">50 / trang</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList; 