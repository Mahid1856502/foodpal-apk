export type Role = "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MOBILE_PAYMENT";
export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export interface Restaurant {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  allowCOD: boolean;
  branches?: Branch[];
  foodItems?: FoodItem[];
  users?: User[];
  orders?: Order[];
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  email?: string | null;
  restaurantId: string;
  openingHours?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  postcode?: string | null;
  deliveryPostcodes: string[];
  restaurant?: Restaurant;
  users?: User[];
  orders?: Order[];
  foodItems?: FoodItem[];
}

export interface User {
  id: string;
  email: string;
  password?: string; // only server-side
  role: Role;
  fullName?: string | null;
  mobileNumber?: string | null;
  restaurantId?: string | null;
  branchId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  restaurant?: Restaurant | null;
  branch?: Branch | null;
  addresses?: Address[];
  orders?: Order[];
  managedOrders?: Order[];
}

export interface Address {
  id: string;
  streetNumber?: string | null;
  streetName?: string | null;
  postcode?: string | null;
  additionalInstructions?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  user?: User;
  orders?: Order[];
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price: string; // Decimal as string
  image: string;
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isAvailable: boolean;
  allergens: string[];
  restaurantId: string;
  branchId?: string | null;
  restaurant?: Restaurant;
  branch?: Branch | null;
  addOns?: AddOn[];
  orderItems?: OrderItem[];
}

export interface AddOn {
  id: string;
  name: string;
  price: string; // Decimal as string
  category: string;
  isRequired: boolean;
  foodItemId: string;
  quantity: number;
  foodItem?: FoodItem;
  orderItems?: OrderItemAddOn[];
}

export interface OrderItemAddOn {
  id: string;
  orderItemId: string;
  addOnId: string;
  orderItem?: OrderItem;
  addOn?: AddOn;
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId: string;
  quantity: number;
  price: string; // Decimal as string
  foodItem?: FoodItem;
  order?: Order;
  addOns?: OrderItemAddOn[];
}

export interface Order {
  id: string;
  userId: string;
  restaurantId?: string | null;
  totalAmount: string; // Decimal as string
  createdAt: string;
  acceptedAt?: string | null;
  updatedAt: string;
  deletedAt?: string | null;

  deliveryAddressId?: string | null;
  deliveryDate?: string | null;
  deliveryTimeSlot?: string | null;
  paymentIntentId?: string | null;

  branchId: string;
  pickupDate?: string | null;
  pickupTimeSlot?: string | null;

  orderType: OrderType;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | null;

  deliveryAddress?: Address | null;
  branch?: Branch;
  user: User;
  restaurant?: Restaurant | null;

  items: OrderItem[];

  managedById?: string | null;
  managedBy?: User | null;

  etaMinutes: number;
}
