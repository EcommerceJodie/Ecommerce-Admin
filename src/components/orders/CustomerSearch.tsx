import React from 'react';
import { Input, Button, Typography, List, Avatar, Empty, Spin } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { Customer } from '../../services/api/orders.service';

const { Text } = Typography;

interface CustomerSearchProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  customers: Customer[];
  loading: boolean;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onSearch: () => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  phoneNumber,
  setPhoneNumber,
  customers,
  loading,
  selectedCustomer,
  onSelectCustomer,
  onSearch
}) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Nhập số điện thoại khách hàng"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{ width: 300 }}
          onPressEnter={onSearch}
        />
        <Button
          type="primary"
          onClick={onSearch}
          loading={loading}
          className="ml-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
        >
          Tìm kiếm
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : customers.length > 0 ? (
        <div className="mb-6">
          <Text strong className="block mb-2">Kết quả tìm kiếm ({customers.length} khách hàng)</Text>
          <List
            itemLayout="horizontal"
            dataSource={customers}
            renderItem={(customer) => (
              <List.Item 
                className={`border p-4 mb-2 rounded-md cursor-pointer transition-all hover:shadow-md hover:border-blue-400 ${selectedCustomer?.id === customer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => onSelectCustomer(customer)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size={50} 
                      style={{ backgroundColor: selectedCustomer?.id === customer.id ? '#1890ff' : '#f0f0f0', color: selectedCustomer?.id === customer.id ? '#fff' : '#666' }}
                      icon={<UserOutlined />}
                    />
                  }
                  title={<Text strong>{customer.fullName}</Text>}
                  description={
                    <div>
                      <div className="flex items-center mb-1">
                        <PhoneOutlined className="mr-2 text-gray-500" /> 
                        <Text>{customer.phoneNumber}</Text>
                      </div>
                      <div className="flex items-center mb-1">
                        <MailOutlined className="mr-2 text-gray-500" /> 
                        <Text>{customer.email}</Text>
                      </div>
                      <div className="flex items-center mb-1">
                        <HomeOutlined className="mr-2 text-gray-500" /> 
                        <Text>{customer.address}</Text>
                      </div>
                      {(customer.city || customer.country) && (
                        <div className="ml-6 text-gray-500">
                          {customer.city}{customer.city && customer.country ? ', ' : ''}{customer.country}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ) : phoneNumber !== '' && !loading ? (
        <Empty
          description="Không tìm thấy khách hàng nào"
          className="py-8"
        />
      ) : null}
    </div>
  );
};

export default CustomerSearch; 