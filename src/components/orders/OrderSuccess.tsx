import React from 'react';
import { Button, Typography, Result } from 'antd';
import { OrderCreateResponse } from '../../services/api/orders.service';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface OrderSuccessProps {
  orderResponse: OrderCreateResponse;
  onCreateNew: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderResponse, onCreateNew }) => {
  const navigate = useNavigate();

  const handleViewOrderList = () => {
    navigate('/orders');
  };

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
            onClick={onCreateNew}
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

export default OrderSuccess; 