import { Form, Typography } from 'antd';
import { Customer } from '../../services/api/orders.service';

const { Text } = Typography;

interface CustomerInfoSectionProps {
  selectedCustomer: Customer | null;
  form: any;
}

const CustomerInfoSection = ({ selectedCustomer, form }: CustomerInfoSectionProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <Typography.Title level={4}>Thông tin khách hàng</Typography.Title>
      {selectedCustomer ? (
        <div className="grid grid-cols-1 gap-y-2">
          <div>
            <Text strong>Họ tên:</Text> {selectedCustomer.fullName}
          </div>
          <div>
            <Text strong>Số điện thoại:</Text> {selectedCustomer.phoneNumber}
          </div>
          <div>
            <Text strong>Email:</Text> {selectedCustomer.email}
          </div>
          <div>
            <Text strong>Địa chỉ:</Text> {selectedCustomer.address}
          </div>
          <div>
            <Text strong>Thành phố:</Text> {selectedCustomer.city || ''}
          </div>
          <div>
            <Text strong>Quốc gia:</Text> {selectedCustomer.country || ''}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-2">
          <div>
            <Text strong>Họ tên:</Text> {(() => {
              // Lấy dữ liệu từ nhiều nguồn khác nhau để đảm bảo có dữ liệu
              const formData = form.getFieldsValue();
              if (formData.fullName) return formData.fullName;
              
              const savedData = localStorage.getItem('orderFormData');
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  if (parsed.fullName) return parsed.fullName;
                } catch (e) {}
              }
              
              return document.querySelector<HTMLInputElement>('input[id$="-fullName"]')?.value || '';
            })()}
          </div>
          <div>
            <Text strong>Số điện thoại:</Text> {(() => {
              const formData = form.getFieldsValue();
              if (formData.phoneNumber) return formData.phoneNumber;
              
              const savedData = localStorage.getItem('orderFormData');
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  if (parsed.phoneNumber) return parsed.phoneNumber;
                } catch (e) {}
              }
              
              return document.querySelector<HTMLInputElement>('input[id$="-phoneNumber"]')?.value || '';
            })()}
          </div>
          <div>
            <Text strong>Email:</Text> {(() => {
              const formData = form.getFieldsValue();
              if (formData.email) return formData.email;
              
              const savedData = localStorage.getItem('orderFormData');
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  if (parsed.email) return parsed.email;
                } catch (e) {}
              }
              
              return document.querySelector<HTMLInputElement>('input[id$="-email"]')?.value || '';
            })()}
          </div>
          <div>
            <Text strong>Địa chỉ:</Text> {(() => {
              const formData = form.getFieldsValue();
              if (formData.address) return formData.address;
              
              const savedData = localStorage.getItem('orderFormData');
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  if (parsed.address) return parsed.address;
                } catch (e) {}
              }
              
              return document.querySelector<HTMLInputElement>('input[id$="-address"]')?.value || '';
            })()}
          </div>
          <div>
            <Text strong>Thành phố:</Text> {(() => {
              const formData = form.getFieldsValue();
              if (formData.city) return formData.city;
              
              const savedData = localStorage.getItem('orderFormData');
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  if (parsed.city) return parsed.city;
                } catch (e) {}
              }
              
              return document.querySelector<HTMLInputElement>('input[id$="-city"]')?.value || '';
            })()}
          </div>
          <div>
            <Text strong>Quốc gia:</Text> {(() => {
              const formData = form.getFieldsValue();
              if (formData.country) return formData.country;
              
              const savedData = localStorage.getItem('orderFormData');
              if (savedData) {
                try {
                  const parsed = JSON.parse(savedData);
                  if (parsed.country) return parsed.country;
                } catch (e) {}
              }
              
              return document.querySelector<HTMLInputElement>('input[id$="-country"]')?.value || '';
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInfoSection; 