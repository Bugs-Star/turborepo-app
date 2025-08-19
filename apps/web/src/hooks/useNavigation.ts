import { useRouter } from "next/navigation";

export const useNavigation = () => {
  const router = useRouter();

  const goToMenu = () => router.push("/menu");
  const goToCart = () => router.push("/cart");
  const goToOrderHistory = () => router.push("/order-history");
  const goToHome = () => router.push("/home");
  const goToProfile = () => router.push("/profile");
  const goToLogin = () => router.push("/login");

  return {
    goToMenu,
    goToCart,
    goToOrderHistory,
    goToHome,
    goToProfile,
    goToLogin,
  };
};
