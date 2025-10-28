// src/types/order.ts

import { Order } from './base';

// 🏦 Payment + Order Enums
export type PAYMENT_METHOD =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MOBILE_PAYMENT';

export type ORDER_TYPE = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type ORDER_STATUS =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PAYMENT_STATUS = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

// 🍔 Add-on inside cart or order
export interface AddOnInput {
  addOnId: string;
  addOnName?: string;
  addOnPrice?: number;
  addOnQuantity?: number;
}

// 🧾 Item within an order
export interface OrderItemInput {
  foodItemId: string;
  foodName: string;
  quantity: number;
  price: number;
  addOns?: AddOnInput[];
}

// 🧠 CreateOrderDto (used for API POST)
export interface CreateOrderDto {
  userId: string;
  restaurantId: string;
  totalAmount: number;
  paymentMethod: PAYMENT_METHOD;
  orderType: ORDER_TYPE;
  branchId: string;
  items: OrderItemInput[];

  // optional fields
  pickupDate?: Date | null;
  pickupTimeSlot?: string;
  deliveryAddressId?: string;
  deliveryDate?: Date | null;
  deliveryTimeSlot?: string;
}

// 🪙 Response from /orders (order creation)
export interface CreateOrderResponse {
  orderId: string;
  checkoutUrl?: string; // Stripe URL if online payment
}

// ✅ Used when fetching existing orders
export interface OrderAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  foodName: string;
  quantity: number;
  price: number;
  addOns: OrderAddOn[];
}

// 🔥 For useTodayOrders() hook
export interface TodayOrdersResponse {
  count: number;
  date: string;
  orders: Order[];
}
