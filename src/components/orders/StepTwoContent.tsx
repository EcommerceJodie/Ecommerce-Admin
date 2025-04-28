import { Typography } from 'antd';
import { Product } from '../../models/Product';
import ProductSearch from './ProductSearch';
import SelectedProducts from './SelectedProducts';

const { Title } = Typography;

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imageUrl?: string;
}

interface StepTwoContentProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  products: Product[];
  loading: boolean;
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  selectedProducts: OrderItem[];
  onSearch: (page?: number, size?: number) => void;
  onAddProduct: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveProduct: (productId: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const StepTwoContent = ({
  searchTerm,
  setSearchTerm,
  products,
  loading,
  totalProducts,
  currentPage,
  pageSize,
  selectedProducts,
  onSearch,
  onAddProduct,
  onUpdateQuantity,
  onRemoveProduct,
  onBack,
  onConfirm
}: StepTwoContentProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-1">
        <Title level={3}>Bước 2: Tìm kiếm sản phẩm</Title>
        <ProductSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          products={products}
          loading={loading}
          totalProducts={totalProducts}
          currentPage={currentPage}
          pageSize={pageSize}
          onSearch={onSearch}
          onAddProduct={onAddProduct}
        />
      </div>

      <div className="col-span-1 mt-12">
        <SelectedProducts
          selectedProducts={selectedProducts}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveProduct={onRemoveProduct}
          onBack={onBack}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
};

export default StepTwoContent; 