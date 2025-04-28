import { Button, Input, Typography } from 'antd';
import { Customer } from '../../services/api/orders.service';
import CustomerInfoSection from './CustomerInfoSection';
import OrderSummarySection from './OrderSummarySection';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imageUrl?: string;
}

interface StepThreeContentProps {
  selectedCustomer: Customer | null;
  selectedProducts: OrderItem[];
  totalAmount: number;
  note: string;
  setNote: (value: string) => void;
  form: any;
  creatingOrder: boolean;
  onBack: () => void;
  onCreateOrder: () => void;
}

const StepThreeContent = ({
  selectedCustomer,
  selectedProducts,
  totalAmount,
  note,
  setNote,
  form,
  creatingOrder,
  onBack,
  onCreateOrder
}: StepThreeContentProps) => {
  return (
    <div>
      <Title level={3}>Bước 3: Xác nhận đơn hàng</Title>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <CustomerInfoSection
            selectedCustomer={selectedCustomer}
            form={form}
          />

          <div className="mt-4">
            <Text strong>Ghi chú đơn hàng:</Text>
            <TextArea 
              rows={4} 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ghi chú về đơn hàng (tùy chọn)"
              className="mt-2"
            />
          </div>
        </div>

        <div className="col-span-1">
          <OrderSummarySection
            selectedProducts={selectedProducts}
            totalAmount={totalAmount}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={onBack}>
          Quay lại
        </Button>
        <Button 
          type="primary" 
          onClick={(e) => {
            console.log('Nút xác nhận đơn hàng được click', e);
            e.preventDefault();
            onCreateOrder();
          }}
          loading={creatingOrder}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600"
        >
          Xác nhận đơn hàng
        </Button>
      </div>
    </div>
  );
};

export default StepThreeContent; 