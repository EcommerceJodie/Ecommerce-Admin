import React from 'react';
import { Steps, Card, Button } from 'antd';
import { UserOutlined, ShoppingCartOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';

interface OrderStepsProps {
  currentStep: number;
  children: React.ReactNode;
  onStepChange: (step: number) => void;
}

const OrderSteps: React.FC<OrderStepsProps> = ({ currentStep, children, onStepChange }) => {
  const steps = [
    {
      title: 'Thông tin khách hàng',
      icon: <UserOutlined />,
      content: 'Tìm kiếm và chọn thông tin khách hàng'
    },
    {
      title: 'Chọn sản phẩm',
      icon: <ShoppingCartOutlined />,
      content: 'Tìm kiếm và chọn sản phẩm cho đơn hàng'
    },
    {
      title: 'Xác nhận đơn hàng',
      icon: <CheckCircleOutlined />,
      content: 'Kiểm tra và xác nhận thông tin đơn hàng'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <Steps
          current={currentStep - 1}
          items={steps.map((step, index) => ({
            title: step.title,
            icon: step.icon,
            description: step.content,
            onClick: () => {
              // Chỉ cho phép quay lại các bước đã hoàn thành
              if (index < currentStep - 1) {
                onStepChange(index + 1);
              }
            },
            className: index < currentStep - 1 ? 'cursor-pointer hover:text-blue-500' : ''
          }))}
        />
      </div>
      
      <Card>
        
        {children}
      </Card>
    </div>
  );
};

export default OrderSteps; 