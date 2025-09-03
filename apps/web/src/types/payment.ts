export interface PaymentMethod {
  value: "card" | "cash" | "point";
  label: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { value: "card", label: "카드" },
  { value: "cash", label: "현금" },
  { value: "point", label: "포인트" },
];
