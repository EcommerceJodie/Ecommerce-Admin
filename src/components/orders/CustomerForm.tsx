import React from 'react';
import { Form, Input, Typography } from 'antd';
import { Customer } from '../../services/api/orders.service';

const { Title, Text } = Typography;

interface CustomerFormProps {
  form: any;
  selectedCustomer: Customer | null;
  initialValues: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    city: string;
    country: string;
  };
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  form,
  selectedCustomer,
  initialValues
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      className="mt-6"
      initialValues={initialValues}
    >
      <Title level={4}>Thông tin khách hàng</Title>
      <p className="mb-4 text-gray-500">
        {selectedCustomer 
          ? `Thông tin của khách hàng "${selectedCustomer.fullName}" đã được chọn. Bạn có thể chỉnh sửa nếu cần.` 
          : 'Vui lòng tìm kiếm và chọn khách hàng hoặc điền thông tin khách hàng mới để tiếp tục.'}
      </p>
      
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item 
          name="fullName" 
          label="Họ tên" 
          rules={[{ required: true, message: 'Vui lòng nhập họ tên khách hàng' }]}
        >
          <Input placeholder="Nhập họ tên khách hàng" />
        </Form.Item>
        
        <Form.Item 
          name="phoneNumber" 
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        
        <Form.Item 
          name="email" 
          label="Email"
        >
          <Input placeholder="Nhập email" />
        </Form.Item>
        
        <Form.Item 
          name="address" 
          label="Địa chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}
        >
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>
        
        <Form.Item 
          name="city" 
          label="Thành phố"
          rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
        >
          <Input placeholder="Nhập thành phố" />
        </Form.Item>
        
        <Form.Item 
          name="country" 
          label="Quốc gia"
          rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}
        >
          <Input placeholder="Nhập quốc gia" />
        </Form.Item>
      </div>
    </Form>
  );
};

export default CustomerForm; 