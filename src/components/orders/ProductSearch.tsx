import React from 'react';
import { Input, Button, Table, Spin, Empty, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Product } from '../../models/Product';

interface ProductSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  products: Product[];
  loading: boolean;
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  onSearch: (page: number, size: number) => void;
  onAddProduct: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  searchTerm,
  setSearchTerm,
  products,
  loading,
  totalProducts,
  currentPage,
  pageSize,
  onSearch,
  onAddProduct
}) => {
  // Chuyển đổi số tiền sang định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Cột cho bảng kết quả tìm kiếm sản phẩm
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: Product) => (
        <div className="flex items-center">
          {record.imageUrls && record.imageUrls.length > 0 && (
            <img 
              src={record.imageUrls[0]} 
              alt={text} 
              className="w-10 h-10 object-cover rounded mr-3"
            />
          )}
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.productSku}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Giá',
      dataIndex: 'productPrice',
      key: 'productPrice',
      render: (price: number, record: Product) => (
        <div>
          {record.productDiscountPrice && record.productDiscountPrice < price ? (
            <div>
              <div className="text-gray-500 line-through text-sm">{formatCurrency(price)}</div>
              <div className="text-red-500 font-medium">{formatCurrency(record.productDiscountPrice)}</div>
            </div>
          ) : (
            <div>{formatCurrency(price)}</div>
          )}
        </div>
      )
    },
    {
      title: 'Tồn kho',
      dataIndex: 'productStock',
      key: 'productStock',
      render: (quantity: number) => (
        <Badge 
          status={quantity > 0 ? 'success' : 'error'} 
          text={quantity > 0 ? `${quantity} sản phẩm` : 'Hết hàng'} 
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: Product) => (
        <Button 
          type="primary" 
          onClick={() => onAddProduct(record)}
          disabled={record.productStock <= 0}
          className="bg-green-600 hover:bg-green-700 border-green-600"
        >
          Thêm vào đơn
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Tìm kiếm sản phẩm theo tên, mã sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 400 }}
          onPressEnter={() => onSearch(1, pageSize)}
          prefix={<SearchOutlined className="text-gray-400" />}
        />
        <Button
          type="primary"
          onClick={() => onSearch(1, pageSize)}
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
      ) : products.length > 0 ? (
        <div className="mb-6">
          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalProducts,
              onChange: (page, size) => onSearch(page, size || 10),
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng số ${total} sản phẩm`
            }}
          />
        </div>
      ) : searchTerm !== '' && !loading ? (
        <Empty
          description="Không tìm thấy sản phẩm nào"
          className="py-8"
        />
      ) : null}
    </div>
  );
};

export default ProductSearch; 