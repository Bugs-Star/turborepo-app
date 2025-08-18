import AddMenu from "./AddMenu";
import ProductList from "./ProductList";
import StockAlert from "./StockAlert";

const StockManagement = () => {
  return (
    <>
      <AddMenu />
      <StockAlert />
      <ProductList />
    </>
  );
};

export default StockManagement;
