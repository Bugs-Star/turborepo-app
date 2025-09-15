/* ------------------------------------------------------------
 * File      : /src/controllers/cartController.js
 * Brief     : 카트 관련 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-08-15
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// 장바구니 아이템을 원하는 형태로 변환하는 헬퍼 함수
const transformCartItems = async (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return [];
  }

  // 모든 productId를 수집
  const productIds = cartItems.map((item) => item.productId);

  // 한 번의 쿼리로 모든 상품 정보 가져오기
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  const transformedItems = cartItems.map((item) => {
    const product = productMap.get(item.productId.toString());
    if (!product) return null;

    // 재고 상태 확인
    const isAvailable = product.currentStock > 0;
    const stockStatus =
      product.currentStock === 0
        ? "out_of_stock"
        : product.currentStock < product.optimalStock
          ? "low_stock"
          : "in_stock";

    return {
      _id: item._id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        _id: product._id,
        productCode: product.productCode,
        productName: product.productName,
        productImg: product.productImg,
        price: product.price,
        category: product.category,
        currentStock: product.currentStock,
      },
      subtotal: product.price * item.quantity,
      isAvailable,
      stockStatus,
    };
  });

  return transformedItems.filter((item) => item !== null);
};

// 요약 정보를 계산하는 헬퍼 함수
const calculateSummary = (cartItems) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount = cartItems.length;

  // 재고 상태별 아이템 개수
  const availableItems = cartItems.filter((item) => item.isAvailable).length;
  const outOfStockItems = cartItems.filter((item) => !item.isAvailable).length;

  return {
    totalAmount,
    totalItems,
    itemCount,
    availableItems,
    outOfStockItems,
  };
};

// 카트 조회
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // .id → ._id로 수정
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const cartItems = await transformCartItems(user.cart);
    const summary = calculateSummary(cartItems);

    res.json({
      cart: cartItems,
      summary,
    });
  } catch (error) {
    console.error("카트 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 카트 개수 조회 (하단 네브바용)
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user._id; // .id → ._id로 수정
    const user = await User.findById(userId).select("cart");

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const totalItems = user.cart.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      count: totalItems,
    });
  } catch (error) {
    console.error("카트 개수 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 상품 추가
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // .id → ._id로 수정
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "상품 ID가 필요합니다." });
    }

    // ObjectId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "유효하지 않은 상품 ID입니다." });
    }

    if (quantity < 1 || quantity > 99) {
      return res
        .status(400)
        .json({ message: "수량은 1개 이상 99개 이하여야 합니다." });
    }

    // 상품 존재 확인 및 재고 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    if (product.currentStock === 0) {
      return res.status(400).json({ message: "현재 재고가 없습니다." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 이미 카트에 있는 상품인지 확인
    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // 기존 상품 수량 증가 (최대 99개 제한)
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      if (newQuantity > 99) {
        return res
          .status(400)
          .json({ message: "카트에 담을 수 있는 최대 수량은 99개입니다." });
      }
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // 카트 최대 아이템 개수 제한 (20개)
      if (user.cart.length >= 20) {
        return res
          .status(400)
          .json({ message: "카트에는 최대 20개의 상품만 담을 수 있습니다." });
      }

      // 새 상품 추가 (재고 확인)
      if (quantity > product.currentStock) {
        return res
          .status(400)
          .json({
            message: `재고가 부족합니다. (현재 재고: ${product.currentStock}개)`,
          });
      }
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.json({
      success: true,
      message:
        existingItemIndex > -1
          ? "수량이 증가되었습니다."
          : "상품이 카트에 추가되었습니다.",
    });
  } catch (error) {
    console.error("카트 추가 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 수량 변경
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id; // .id → ._id로 수정
    const { itemId } = req.params;
    const { quantity } = req.body;

    // ObjectId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 카트 아이템 ID입니다." });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "유효한 수량을 입력해주세요." });
    }

    if (quantity > 99) {
      return res
        .status(400)
        .json({ message: "수량은 99개를 초과할 수 없습니다." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "카트 아이템을 찾을 수 없습니다." });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    res.json({
      success: true,
      message: "수량이 변경되었습니다.",
    });
  } catch (error) {
    console.error("카트 수량 변경 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 상품 제거
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id; // .id → ._id로 수정
    const { itemId } = req.params;

    // ObjectId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 카트 아이템 ID입니다." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "카트 아이템을 찾을 수 없습니다." });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: "상품이 카트에서 제거되었습니다.",
    });
  } catch (error) {
    console.error("장바구니 제거 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 장바구니 비우기
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id; // .id → ._id로 수정

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 장바구니가 이미 비어있는지 확인
    if (user.cart.length === 0) {
      return res.status(400).json({ message: "장바구니가 이미 비어있습니다." });
    }

    const itemCount = user.cart.length;
    user.cart = [];
    await user.save();

    console.log(
      `사용자 ${userId}의 카트에서 ${itemCount}개 아이템이 제거되었습니다.`
    );

    res.json({
      success: true,
      message: "카트가 비워졌습니다.",
    });
  } catch (error) {
    console.error("카트 비우기 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
