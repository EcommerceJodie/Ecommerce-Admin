import React, { useEffect, useState } from 'react';
import { Button, Typography, Result, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { OrderCreateResponse } from '../../../services/api/orders.service';

const { Title, Text } = Typography;

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderResponse, setOrderResponse] = useState<OrderCreateResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu đơn hàng từ state của location hoặc localStorage
    const orderData = location.state?.orderResponse;
    
    if (orderData) {
      setOrderResponse(orderData);
      // Lưu vào localStorage để tránh mất dữ liệu khi refresh
      localStorage.setItem('lastOrderResponse', JSON.stringify(orderData));
    } else {
      // Nếu không có trong state, thử lấy từ localStorage
      const savedOrder = localStorage.getItem('lastOrderResponse');
      if (savedOrder) {
        try {
          setOrderResponse(JSON.parse(savedOrder));
        } catch (e) {
          console.error('Lỗi khi parse dữ liệu đơn hàng:', e);
        }
      }
    }
    
    setLoading(false);
  }, [location]);

  const handleCreateNew = () => {
    navigate('/orders/create-manual');
  };

  const handleViewOrderList = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
      </div>
    );
  }

  if (!orderResponse) {
    return (
      <Result
        status="warning"
        title="Không tìm thấy thông tin đơn hàng"
        extra={[
          <Button 
            type="primary" 
            key="new-order" 
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            Tạo đơn hàng mới
          </Button>,
          <Button key="view-orders" onClick={handleViewOrderList}>
            Xem danh sách đơn hàng
          </Button>
        ]}
      />
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Result
        status="success"
        title="Đơn hàng đã được tạo thành công!"
        subTitle={`Mã đơn hàng: ${orderResponse.orderNumber}`}
        extra={[
          <Button 
            type="primary" 
            key="new-order" 
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            Tạo đơn hàng mới
          </Button>,
          <Button key="view-orders" onClick={handleViewOrderList}>
            Xem danh sách đơn hàng
          </Button>
        ]}
      >
        <div className="bg-gray-50 p-4 rounded-md my-4">
          <Title level={5}>Chi tiết đơn hàng</Title>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text strong>Khách hàng:</Text> {orderResponse.customerName}
            </div>
            <div>
              <Text strong>Tổng tiền:</Text> {orderResponse.totalAmount.toLocaleString('vi-VN')}đ
            </div>
            <div>
              <Text strong>Địa chỉ giao hàng:</Text> {orderResponse.shippingAddress}
            </div>
            <div>
              <Text strong>Phương thức thanh toán:</Text> {orderResponse.paymentMethod}
            </div>
            <div>
              <Text strong>Thời gian tạo:</Text> {new Date(orderResponse.createdAt).toLocaleString('vi-VN')}
            </div>
            <div>
              <Text strong>Trạng thái:</Text> {
                orderResponse.orderStatus === 1 ? 'Chờ xác nhận' :
                orderResponse.orderStatus === 2 ? 'Đã xác nhận' :
                orderResponse.orderStatus === 3 ? 'Đang giao hàng' :
                orderResponse.orderStatus === 4 ? 'Đã giao hàng' :
                orderResponse.orderStatus === 5 ? 'Đã hủy' : 'Không xác định'
              }
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mt-4">
          <Title level={5}>Sản phẩm đã đặt</Title>
          <div className="max-h-80 overflow-y-auto">
            {orderResponse.orderDetails.map((item) => (
              <div key={item.id} className="flex items-center py-3 border-b">
                <div className="w-16">
                  {item.productImageUrl && (
                    <img 
                      src={item.productImageUrl} 
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div>{item.productName}</div>
                  <div className="text-gray-600 text-sm">
                    {item.quantity} x {item.unitPrice.toLocaleString('vi-VN')}đ
                  </div>
                </div>
                <div className="font-semibold">
                  {item.subtotal.toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>
        </div>
      </Result>
    </div>
  );
};

export default OrderSuccessPage; 