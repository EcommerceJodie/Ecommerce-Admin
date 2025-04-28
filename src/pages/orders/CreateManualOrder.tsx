import { useOrderForm } from '../../hooks/useOrderForm';
import OrderSteps from '../../components/orders/OrderSteps';
import StepOneContent from '../../components/orders/StepOneContent';
import StepTwoContent from '../../components/orders/StepTwoContent';
import StepThreeContent from '../../components/orders/StepThreeContent';

const CreateManualOrder = () => {
  const orderForm = useOrderForm();
  
  return (
    <OrderSteps currentStep={orderForm.step} onStepChange={orderForm.handleStepChange}>
      
      {orderForm.step === 1 && (
        <StepOneContent
          form={orderForm.form}
          phoneNumber={orderForm.phoneNumber}
          setPhoneNumber={orderForm.setPhoneNumber}
          customers={orderForm.customers}
          loading={orderForm.loading}
          selectedCustomer={orderForm.selectedCustomer}
          onSelectCustomer={orderForm.selectCustomer}
          onSearch={orderForm.searchCustomers}
          onNextStep={orderForm.handleNextStep}
        />
      )}
      
      {orderForm.step === 2 && (
        <StepTwoContent
          searchTerm={orderForm.searchTerm}
          setSearchTerm={orderForm.setSearchTerm}
          products={orderForm.products}
          loading={orderForm.loadingProducts}
          totalProducts={orderForm.totalProducts}
          currentPage={orderForm.currentPage}
          pageSize={orderForm.pageSize}
          selectedProducts={orderForm.selectedProducts}
          onSearch={orderForm.searchProducts}
          onAddProduct={orderForm.addProductToOrder}
          onUpdateQuantity={orderForm.updateProductQuantity}
          onRemoveProduct={orderForm.removeProductFromOrder}
          onBack={() => orderForm.handleStepChange(1)}
          onConfirm={orderForm.handleConfirmOrder}
        />
      )}

      {orderForm.step === 3 && !orderForm.orderSuccess && (
        <StepThreeContent
          selectedCustomer={orderForm.selectedCustomer}
          selectedProducts={orderForm.selectedProducts}
          totalAmount={orderForm.totalAmount}
          note={orderForm.note}
          setNote={orderForm.setNote}
          form={orderForm.form}
          creatingOrder={orderForm.creatingOrder}
          onBack={() => orderForm.handleStepChange(2)}
          onCreateOrder={orderForm.handleCreateOrder}
        />
      )}

    </OrderSteps>
  );
};

export default CreateManualOrder; 
