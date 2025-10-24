import { Order } from '../types/base';

// [ORDER PAD] Color + progress helpers
export function progressFor(order: Order) {
  if (!order.acceptedAt) return 1;
  const elapsed =
    (Date.now() - new Date(order.acceptedAt).getTime()) / 1000 / 60; // minutes
  const pct = Math.max(0, Math.min(1, 1 - elapsed / order.etaMinutes));
  return pct; // 1 -> 0
}
