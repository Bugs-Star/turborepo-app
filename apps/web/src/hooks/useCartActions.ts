import { useCart } from "./useCart";

export const useCartActions = () => {
  const {
    removeFromCart,
    updateCartItemQuantity,
    isLoading: isActionLoading,
  } = useCart();

  const handleQuantityChange = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await handleRemove(id);
    } else {
      await updateCartItemQuantity(id, quantity);
    }
  };

  const handleRemove = async (id: string) => {
    await removeFromCart(id);
  };

  return {
    handleQuantityChange,
    handleRemove,
    isActionLoading,
  };
};
