import { Divider, Typography } from 'antd';

const { Title, Text } = Typography;

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderSummarySectionProps {
  selectedProducts: OrderItem[];
  totalAmount: number;
}

const OrderSummarySection = ({ selectedProducts, totalAmount }: OrderSummarySectionProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <Title level={4}>Thông tin sản phẩm</Title>
      <div className="max-h-96 overflow-y-auto">
        {selectedProducts.map((product) => (
          <div key={product.productId} className="flex items-center mb-4 py-2 border-b">
            <div className="w-16">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.productName}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
            </div>
            <div className="flex-1">
              <div>{product.productName}</div>
              <div className="text-gray-600 text-sm">
                {product.quantity} x {product.discountedPrice.toLocaleString('vi-VN')}đ
              </div>
            </div>
            <div className="font-semibold">
              {(product.discountedPrice * product.quantity).toLocaleString('vi-VN')}đ
            </div>
          </div>
        ))}
      </div>
      <Divider className="my-2" />
      <div className="flex justify-between">
        <Text strong>Tổng tiền:</Text>
        <Text strong className="text-lg text-red-600">
          {totalAmount.toLocaleString('vi-VN')}đ
        </Text>
      </div>
    </div>
  );
};

export default OrderSummarySection; 