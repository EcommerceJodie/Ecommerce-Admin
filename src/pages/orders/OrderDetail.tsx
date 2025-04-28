import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  Button, 
  Tag, 
  Spin, 
  Row, 
  Col, 
  Divider, 
  Descriptions, 
  Table, 
  Image, 
  Space,
  Result,
  message
} from 'antd';
import { 
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { Order, OrderStatus, getOrderStatusName } from '../../models/Order';

const { Title, Text } = Typography;

// Lưu ý: Component này chỉ là mô phỏng, bạn cần tạo API thực tế để lấy chi tiết đơn hàng
const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        // Mô phỏng API call, thay thế bằng API thực tế khi có
        setTimeout(() => {
          // Dữ liệu mẫu, thay thế bằng kết quả API thực tế
          const mockOrder: Order = {
            id: id || '5fa85f64-5717-4562-b3fc-2c963f66afa8',
            orderNumber: 'ORD-20230915-0001',
            createdAt: new Date().toISOString(),
            customerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            customerName: 'Nguyễn Văn A',
            phoneNumber: '0901234567',
            totalAmount: 2500000,
            orderStatus: OrderStatus.Processing,
            paymentMethod: 'VNPAY',
            paymentStatus: 'Đã thanh toán',
            note: 'Giao hàng trong giờ hành chính'
          };

          const mockOrderDetails = [
            {
              id: '1',
              productName: 'iPhone 13 Pro Max',
              quantity: 1,
              unitPrice: 1800000,
              subtotal: 1800000,
              discount: 0,
              productImageUrl: 'https://via.placeholder.com/50'
            },
            {
              id: '2',
              productName: 'Ốp lưng iPhone 13 Pro Max',
              quantity: 2,
              unitPrice: 350000,
              subtotal: 700000,
              discount: 0,
              productImageUrl: 'https://via.placeholder.com/50'
            }
          ];

          setOrder(mockOrder);
          setOrderDetails(mockOrderDetails);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        message.error('Không thể tải thông tin chi tiết đơn hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const handleBack = () => {
    navigate('/orders');
  };

  // Helper function to get status tag color
  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case OrderStatus.Pending:
        return 'warning';
      case OrderStatus.Processing:
        return 'processing';
      case OrderStatus.Shipped:
        return 'blue';
      case OrderStatus.Delivered:
        return 'success';
      case OrderStatus.Cancelled:
        return 'error';
      case OrderStatus.Returned:
        return 'default';
      case OrderStatus.Refunded:
        return 'purple';
      default:
        return 'default';
    }
  };

  // Format date to local format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Table columns for order details
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (_: string, record: any) => (
        <Space>
          <Image 
            src={record.productImageUrl} 
            alt={record.productName} 
            width={40} 
            height={40} 
            preview={false}
          />
          <Text>{record.productName}</Text>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => formatCurrency(price),
      align: 'right' as const,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal: number) => formatCurrency(subtotal),
      align: 'right' as const,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          style={{ marginBottom: '16px' }}
        >
          Trở về danh sách
        </Button>
        
        <Result
          status="404"
          title="Không tìm thấy đơn hàng"
          subTitle="Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          extra={<Button type="primary" onClick={handleBack}>Quay lại danh sách đơn hàng</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        style={{ marginBottom: '16px' }}
      >
        Trở về danh sách
      </Button>

      <Title level={4}>Chi tiết đơn hàng #{order.orderNumber}</Title>

      <Row gutter={[16, 16]}>
        {/* Thông tin đơn hàng */}
        <Col xs={24} md={12}>
          <Card title="Thông tin đơn hàng">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label="Mã đơn hàng">
                {order.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(order.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(order.orderStatus as number)}>
                  {getOrderStatusName(order.orderStatus as number)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {order.paymentStatus}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {order.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong>{formatCurrency(order.totalAmount)}</Text>
              </Descriptions.Item>
              {order.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {order.note}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Thông tin khách hàng */}
        <Col xs={24} md={12}>
          <Card title="Thông tin khách hàng">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên khách hàng">
                {order.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {order.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Chi tiết đơn hàng */}
        <Col span={24}>
          <Card title="Chi tiết sản phẩm">
            <Table 
              dataSource={orderDetails} 
              columns={columns} 
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      <Text strong>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>{formatCurrency(order.totalAmount)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetail; 