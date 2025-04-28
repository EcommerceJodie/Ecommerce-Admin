import React from 'react';
import { Table, Typography, InputNumber, Button, Empty, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imageUrl?: string;
}

interface SelectedProductsProps {
  selectedProducts: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveProduct: (productId: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const SelectedProducts: React.FC<SelectedProductsProps> = ({
  selectedProducts,
  onUpdateQuantity,
  onRemoveProduct,
  onBack,
  onConfirm
}) => {
  // Chuyển đổi số tiền sang định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tính tổng tiền đơn hàng
  const calculateTotalAmount = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
  };

  // Cột cho bảng sản phẩm đã chọn
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: OrderItem) => (
        <div className="flex items-center">
          {record.imageUrl && (
            <img 
              src={record.imageUrl} 
              alt={text} 
              className="w-10 h-10 object-cover rounded mr-3"
            />
          )}
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Đơn giá',
      dataIndex: 'discountedPrice',
      key: 'discountedPrice',
      render: (price: number, record: OrderItem) => (
        <div>
          {record.discountedPrice < record.price ? (
            <div>
              <div className="text-gray-500 line-through text-sm">{formatCurrency(record.price)}</div>
              <div className="text-red-500 font-medium">{formatCurrency(record.discountedPrice)}</div>
            </div>
          ) : (
            <div>{formatCurrency(price)}</div>
          )}
        </div>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: OrderItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => onUpdateQuantity(record.productId, value || 0)}
          className="w-20"
        />
      )
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      render: (record: OrderItem) => (
        <div className="font-medium">
          {formatCurrency(record.discountedPrice * record.quantity)}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: OrderItem) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => onRemoveProduct(record.productId)}
        />
      )
    }
  ];

  return (
    <div className="mb-4">
      <Title level={4}>Sản phẩm đã chọn</Title>
      {selectedProducts.length > 0 ? (
        <div>
          <Table
            dataSource={selectedProducts}
            columns={columns}
            rowKey="productId"
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Tổng cộng:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong className="text-lg text-red-500">
                    {formatCurrency(calculateTotalAmount())}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )}
          />
          
          <div className="flex justify-end mt-4">
            <Space>
              <Button 
                onClick={onBack}
                className="bg-gray-500 hover:bg-gray-600 border-gray-500 text-white"
              >
                Quay lại
              </Button>
              <Button 
                type="primary" 
                onClick={onConfirm}
                className="bg-green-600 hover:bg-green-700 border-green-600"
              >
                Xác nhận đơn hàng
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <Empty
          description="Chưa có sản phẩm nào được chọn"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default SelectedProducts; 