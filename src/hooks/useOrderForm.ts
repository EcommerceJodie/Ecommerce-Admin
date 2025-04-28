import { useState, useEffect, useCallback } from 'react';
import { Form, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  ordersApiService, 
  Customer, 
  OrderCreateRequest, 
  OrderCreateResponse 
} from '../services/api/orders.service';
import { 
  productsApiService, 
  ProductQueryParams 
} from '../services/api/products.service';
import { Product } from '../models/Product';
import { CustomerFormData, OrderItem, OrderState } from '../models/OrderModel';

export const useOrderForm = () => {
  const [form] = Form.useForm<CustomerFormData>();
  const [state, setState] = useState<OrderState>({
    form,
    phoneNumber: localStorage.getItem('phoneNumber') || '',
    customers: [],
    loading: false,
    selectedCustomer: JSON.parse(localStorage.getItem('selectedCustomer') || 'null'),
    step: parseInt(localStorage.getItem('currentStep') || '1'),
    
    // Bước 2
    searchTerm: '',
    products: [],
    totalProducts: 0,
    currentPage: 1,
    pageSize: 10,
    loadingProducts: false,
    selectedProducts: JSON.parse(localStorage.getItem('selectedProducts') || '[]'),
    totalAmount: 0,
    
    // Bước 3
    note: localStorage.getItem('orderNote') || '',
    creatingOrder: false,
    orderResponse: null,
    orderSuccess: false
  });
  
  const navigate = useNavigate();
  
  // Khôi phục dữ liệu form từ localStorage khi component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('orderFormData');
    console.log('Loading form data:', savedFormData);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Đảm bảo form đã được mount trước khi set giá trị
        setTimeout(() => {
          form.setFieldsValue(parsedData);
        }, 0);
      } catch (error) {
        console.error('Error parsing form data:', error);
      }
    }

    const savedNote = localStorage.getItem('orderNote');
    if (savedNote) {
      setState(prev => ({ ...prev, note: savedNote }));
    }
  }, []);

  // Lưu dữ liệu form vào localStorage khi có thay đổi
  useEffect(() => {
    // Sử dụng Form.useWatch hoặc form.getFieldsValue() trong form.submit để lưu dữ liệu form
    const saveFormData = () => {
      const formData = form.getFieldsValue(true);
      console.log('Saving form data:', formData);
      if (Object.keys(formData).length > 0) {
        localStorage.setItem('orderFormData', JSON.stringify(formData));
      }
    };

    // Sử dụng listener cho form để lưu khi có thay đổi
    form.getFieldsValue();
    
    // Lưu khi component unmount
    return () => {
      saveFormData();
    };
  }, [form]);

  // Lưu selected products
  useEffect(() => {
    console.log('Saving selected products:', state.selectedProducts);
    localStorage.setItem('selectedProducts', JSON.stringify(state.selectedProducts));
  }, [state.selectedProducts]);

  // Lưu step
  useEffect(() => {
    console.log('Saving step:', state.step);
    localStorage.setItem('currentStep', state.step.toString());
  }, [state.step]);

  // Lưu phone number
  useEffect(() => {
    console.log('Saving phone number:', state.phoneNumber);
    localStorage.setItem('phoneNumber', state.phoneNumber);
  }, [state.phoneNumber]);

  // Lưu selected customer
  useEffect(() => {
    console.log('Saving selected customer:', state.selectedCustomer);
    localStorage.setItem('selectedCustomer', JSON.stringify(state.selectedCustomer));
  }, [state.selectedCustomer]);

  // Lưu ghi chú
  useEffect(() => {
    localStorage.setItem('orderNote', state.note);
  }, [state.note]);

  // Xử lý thay đổi bước
  const handleStepChange = useCallback((newStep: number) => {
    setState(prev => ({ ...prev, step: newStep }));
  }, []);

  // Tính toán lại tổng tiền mỗi khi selectedProducts thay đổi
  useEffect(() => {
    calculateTotalAmount();
  }, [state.selectedProducts]);

  // Tìm kiếm sản phẩm
  const searchProducts = useCallback(async (page = 1, size = 10) => {
    if (!state.searchTerm || state.searchTerm.length < 2) {
      notification.warning({
        message: 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm'
      });
      return;
    }

    setState(prev => ({ ...prev, loadingProducts: true }));
    try {
      const params: ProductQueryParams = {
        pageNumber: page,
        pageSize: size,
        searchTerm: state.searchTerm,
        inStock: true
      };
      
      console.log('Searching products with params:', params);
      const result = await productsApiService.getPagedProducts(params);
      console.log('Search result:', result);
      
      setState(prev => ({
        ...prev,
        products: result.items,
        totalProducts: result.totalCount,
        currentPage: page,
        pageSize: size,
        loadingProducts: false
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      notification.error({
        message: 'Lỗi khi tìm kiếm sản phẩm',
        description: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại sau.'
      });
      setState(prev => ({ ...prev, loadingProducts: false }));
    }
  }, [state.searchTerm]);

  // Các hàm xử lý bước 1 (tìm kiếm khách hàng)
  const searchCustomers = useCallback(async () => {
    if (!state.phoneNumber || state.phoneNumber.length < 3) {
      notification.warning({
        message: 'Vui lòng nhập ít nhất 3 ký tự số điện thoại'
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await ordersApiService.searchCustomers(state.phoneNumber);
      setState(prev => ({ ...prev, customers: response, loading: false }));
      
      // Nếu không tìm thấy khách hàng nào, hiển thị form trống để nhập thông tin mới
      if (response.length === 0) {
        // Reset form và chỉ giữ lại số điện thoại
        form.setFieldsValue({
          id: '',
          fullName: '',
          phoneNumber: state.phoneNumber,
          email: '',
          address: '',
          city: '',
          country: ''
        });
        // Không có khách hàng nào được chọn
        setState(prev => ({ ...prev, selectedCustomer: null }));
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi khi tìm kiếm khách hàng',
        description: 'Đã xảy ra lỗi khi tìm kiếm khách hàng. Vui lòng thử lại sau.'
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.phoneNumber, form]);

  const selectCustomer = useCallback((customer: Customer) => {
    setState(prev => ({ ...prev, selectedCustomer: customer }));
    
    // Điền thông tin khách hàng vào form
    form.setFieldsValue({
      id: customer.id,
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      address: customer.address,
      city: customer.city || '',
      country: customer.country || ''
    });
  }, [form]);

  // Thêm sản phẩm vào đơn hàng
  const addProductToOrder = useCallback((product: Product) => {
    // Kiểm tra xem sản phẩm đã được thêm vào đơn hàng chưa
    const existingItem = state.selectedProducts.find(item => item.productId === product.id);
    
    setState(prev => {
      if (existingItem) {
        // Nếu đã có, tăng số lượng lên 1
        const updatedItems = prev.selectedProducts.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        return { ...prev, selectedProducts: updatedItems };
      } else {
        // Nếu chưa có, thêm mới vào danh sách
        const newItem: OrderItem = {
          productId: product.id,
          productName: product.productName,
          price: product.productPrice,
          discountedPrice: product.productDiscountPrice || product.productPrice,
          quantity: 1,
          imageUrl: product.imageUrls[0]
        };
        return { ...prev, selectedProducts: [...prev.selectedProducts, newItem] };
      }
    });
  }, [state.selectedProducts]);

  // Cập nhật số lượng sản phẩm
  const updateProductQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Nếu số lượng <= 0, xóa sản phẩm khỏi đơn hàng
      removeProductFromOrder(productId);
      return;
    }
    
    setState(prev => {
      const updatedItems = prev.selectedProducts.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      );
      return { ...prev, selectedProducts: updatedItems };
    });
  }, []);

  // Xóa sản phẩm khỏi đơn hàng
  const removeProductFromOrder = useCallback((productId: string) => {
    setState(prev => {
      const updatedItems = prev.selectedProducts.filter(item => item.productId !== productId);
      return { ...prev, selectedProducts: updatedItems };
    });
  }, []);

  // Tính tổng tiền đơn hàng
  const calculateTotalAmount = useCallback(() => {
    const total = state.selectedProducts.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
    setState(prev => ({ ...prev, totalAmount: total }));
  }, [state.selectedProducts]);

  const handleNextStep = useCallback(() => {
    // Lưu dữ liệu form trước khi chuyển bước
    const formData = form.getFieldsValue(true);
    localStorage.setItem('orderFormData', JSON.stringify(formData));
    
    form
      .validateFields()
      .then(() => {
        setState(prev => ({ ...prev, step: 2 }));
      })
      .catch((info) => {
        notification.error({
          message: 'Vui lòng kiểm tra lại thông tin khách hàng',
          description: 'Đảm bảo rằng bạn đã điền đầy đủ các trường bắt buộc'
        });
      });
  }, [form]);

  const handleReviewOrder = useCallback(() => {
    if (state.selectedProducts.length === 0) {
      notification.warning({
        message: 'Vui lòng chọn ít nhất một sản phẩm để tiếp tục'
      });
      return;
    }
    setState(prev => ({ ...prev, step: 3 }));
  }, [state.selectedProducts]);

  const handleCreateOrder = useCallback(async () => {
    console.log('handleCreateOrder được gọi');
    
    // Lấy dữ liệu form từ Form Ant Design
    let formData: CustomerFormData;
    
    try {
      // Thử lấy dữ liệu từ form của Ant Design
      formData = form.getFieldsValue(true);
      console.log('Form data (from form.getFieldsValue):', formData);
      
      // Nếu form data trống, thử lấy từ localStorage
      if (!formData || Object.keys(formData).length === 0) {
        const savedFormData = localStorage.getItem('orderFormData');
        console.log('Saved form data:', savedFormData);
        if (savedFormData) {
          formData = JSON.parse(savedFormData);
          console.log('Form data (from localStorage):', formData);
        }
      }
    } catch (error) {
      console.error('Error getting form data:', error);
      // Fallback: lấy dữ liệu từ DOM nếu không thể lấy từ form
      formData = {
        id: state.selectedCustomer?.id || '',
        fullName: document.querySelector<HTMLInputElement>('input[id$="-fullName"]')?.value || '',
        phoneNumber: document.querySelector<HTMLInputElement>('input[id$="-phoneNumber"]')?.value || '',
        email: document.querySelector<HTMLInputElement>('input[id$="-email"]')?.value || '',
        address: document.querySelector<HTMLInputElement>('input[id$="-address"]')?.value || '',
        city: document.querySelector<HTMLInputElement>('input[id$="-city"]')?.value || '',
        country: document.querySelector<HTMLInputElement>('input[id$="-country"]')?.value || ''
      };
      console.log('Form data (from DOM fallback):', formData);
    }
    
    // Kiểm tra customerId
    if (!formData.id && !state.selectedCustomer) {
      notification.error({
        message: 'Không thể tạo đơn hàng',
        description: 'Vui lòng chọn hoặc nhập thông tin khách hàng'
      });
      console.log('Lỗi: Không có customerId');
      return;
    }

    if (state.selectedProducts.length === 0) {
      notification.error({
        message: 'Không thể tạo đơn hàng',
        description: 'Vui lòng chọn ít nhất một sản phẩm'
      });
      console.log('Lỗi: Không có sản phẩm nào');
      return;
    }

    // Kiểm tra số điện thoại
    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      notification.error({
        message: 'Thiếu thông tin',
        description: 'Số điện thoại khách hàng là bắt buộc'
      });
      console.log('Lỗi: Thiếu số điện thoại');
      return;
    }

    // Kiểm tra địa chỉ giao hàng
    if (!formData.address || formData.address.trim() === '') {
      notification.error({
        message: 'Thiếu thông tin',
        description: 'Địa chỉ giao hàng là bắt buộc'
      });
      console.log('Lỗi: Thiếu địa chỉ giao hàng');
      return;
    }

    // Tạo request
    const request: OrderCreateRequest = {
      customerId: formData.id || state.selectedCustomer?.id || '',
      phoneNumber: formData.phoneNumber.trim(),
      shippingAddress: formData.address.trim(),
      note: state.note,
      orderItems: state.selectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    console.log('Request data:', request);
    setState(prev => ({ ...prev, creatingOrder: true }));
    
    try {
      console.log('Gửi request đến API...');
      const response = await ordersApiService.createManualOrder(request);
      console.log('Phản hồi từ API:', response);
      setState(prev => ({ 
        ...prev, 
        orderResponse: response,
        orderSuccess: true,
        creatingOrder: false
      }));
      
      // Xóa dữ liệu đã lưu sau khi tạo đơn hàng thành công
      clearStoredData();
      
      // Chuyển hướng đến trang thành công với dữ liệu đơn hàng
      navigate('/orders/success', { state: { orderResponse: response } });
    } catch (error) {
      console.error('Error creating order:', error);
      notification.error({
        message: 'Lỗi khi tạo đơn hàng',
        description: 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.'
      });
      setState(prev => ({ ...prev, creatingOrder: false }));
    }
  }, [state.selectedCustomer, state.selectedProducts, state.note, form, navigate]);

  const handleConfirmOrder = useCallback(() => {
    // Chuyển sang bước xác nhận thay vì tạo đơn hàng
    handleReviewOrder();
  }, [handleReviewOrder]);

  const clearStoredData = useCallback(() => {
    // Xóa dữ liệu đã lưu
    localStorage.removeItem('orderFormData');
    localStorage.removeItem('selectedProducts');
    localStorage.removeItem('currentStep');
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('selectedCustomer');
    localStorage.removeItem('orderNote');
    
    // Reset các state
    form.resetFields();
    setState(prev => ({
      ...prev,
      selectedProducts: [],
      step: 1,
      phoneNumber: '',
      selectedCustomer: null,
      note: ''
    }));
  }, [form]);

  const setPhoneNumber = useCallback((value: string) => {
    setState(prev => ({ ...prev, phoneNumber: value }));
  }, []);

  const setSearchTerm = useCallback((value: string) => {
    setState(prev => ({ ...prev, searchTerm: value }));
  }, []);

  const setNote = useCallback((value: string) => {
    setState(prev => ({ ...prev, note: value }));
  }, []);

  return {
    ...state,
    form,
    setPhoneNumber,
    setSearchTerm,
    setNote,
    handleStepChange,
    searchProducts,
    searchCustomers,
    selectCustomer,
    addProductToOrder,
    updateProductQuantity,
    removeProductFromOrder,
    handleNextStep,
    handleReviewOrder,
    handleCreateOrder,
    handleConfirmOrder,
    clearStoredData
  };
}; 