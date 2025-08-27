import { useRouter } from "next/navigation";

export const useNavigation = () => {
  const router = useRouter();

  const goToMenu = () => router.push("menu");
  const goToCart = () => router.push("cart");
  const goToOrderHistory = () => router.push("order-history");
  const goToHome = () => router.push("home");
  const goToProfile = () => router.push("profile");
  const goToProfileEdit = () => router.push("profile/edit");
  const goToLogin = () => router.push("login");
  const goToSignup = () => router.push("signup");

  return {
    goToMenu,
    goToCart,
    goToOrderHistory,
    goToHome,
    goToProfile,
    goToProfileEdit,
    goToLogin,
    goToSignup,
  };
};
