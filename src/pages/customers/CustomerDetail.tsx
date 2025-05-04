import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApiService } from '../../services/api/customers.service';
import { Customer } from '../../models/Customer';
import Swal from 'sweetalert2';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await customersApiService.getById(id);
        setCustomer(data);
      } catch (error) {
        console.error('Failed to fetch customer details', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể tải thông tin khách hàng',
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    
    setIsUpdating(true);
    try {
      await customersApiService.updateStatus(customer.id, !customer.isActive);
      
      // Cập nhật state customer với trạng thái mới
      setCustomer({
        ...customer,
        isActive: !customer.isActive
      });
      
      Swal.fire({
        title: 'Thành công',
        text: 'Cập nhật trạng thái thành công',
        icon: 'success',
        confirmButtonText: 'Đóng'
      });
    } catch (error) {
      console.error('Failed to update customer status', error);
      Swal.fire({
        title: 'Lỗi',
        text: 'Không thể cập nhật trạng thái khách hàng',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Không tìm thấy khách hàng</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Khách hàng với ID đã cho không tồn tại hoặc đã bị xóa.</p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Quay lại danh sách khách hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Chi tiết khách hàng</h1>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              customer.isActive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            {isUpdating ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {customer.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
          </button>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin khách hàng</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Chi tiết cá nhân và thông tin liên hệ.</p>
          </div>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              customer.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            } flex items-center justify-center text-center`}
          >
            {customer.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
          </span>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.fullName}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.phoneNumber}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ngày sinh</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(customer.dateOfBirth).toLocaleDateString('vi-VN')}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Địa chỉ</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customer.address}, {customer.city}, {customer.postalCode}, {customer.country}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.userId}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Số đơn hàng</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.orderCount}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ngày đăng ký</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(customer.createdAt).toLocaleDateString('vi-VN')} {new Date(customer.createdAt).toLocaleTimeString('vi-VN')}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Lần cập nhật cuối</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(customer.updatedAt).toLocaleDateString('vi-VN')} {new Date(customer.updatedAt).toLocaleTimeString('vi-VN')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Nút điều hướng đến đơn hàng của khách hàng */}
      {customer.orderCount > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/orders?customerId=${customer.id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            Xem đơn hàng của khách hàng
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail; 