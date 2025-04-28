import { Button, Form, Typography } from 'antd';
import { Customer } from '../../services/api/orders.service';
import CustomerSearch from './CustomerSearch';
import CustomerForm from './CustomerForm';

const { Title } = Typography;

interface StepOneContentProps {
  form: any;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  customers: Customer[];
  loading: boolean;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onSearch: () => void;
  onNextStep: () => void;
}

const StepOneContent = ({
  form,
  phoneNumber,
  setPhoneNumber,
  customers,
  loading,
  selectedCustomer,
  onSelectCustomer,
  onSearch,
  onNextStep
}: StepOneContentProps) => {
  return (
    <div>
      <Title level={3}>Bước 1: Tìm kiếm khách hàng</Title>
      <CustomerSearch
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        customers={customers}
        loading={loading}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={onSelectCustomer}
        onSearch={onSearch}
      />

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(_, values) => {
          console.log('Form values changed:', values);
          localStorage.setItem('orderFormData', JSON.stringify(values));
        }}
        initialValues={{
          id: selectedCustomer?.id || '',
          fullName: selectedCustomer?.fullName || '',
          phoneNumber: selectedCustomer?.phoneNumber || phoneNumber,
          email: selectedCustomer?.email || '',
          address: selectedCustomer?.address || '',
          city: selectedCustomer?.city || '',
          country: selectedCustomer?.country || ''
        }}
      >
        <CustomerForm 
          form={form}
          selectedCustomer={selectedCustomer}
          initialValues={{
            id: selectedCustomer?.id || '',
            fullName: selectedCustomer?.fullName || '',
            phoneNumber: selectedCustomer?.phoneNumber || phoneNumber,
            email: selectedCustomer?.email || '',
            address: selectedCustomer?.address || '',
            city: selectedCustomer?.city || '',
            country: selectedCustomer?.country || ''
          }}
        />
      </Form>
      
      <div className="flex justify-end mt-4">
        <Button 
          type="primary" 
          onClick={onNextStep}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600"
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default StepOneContent; 