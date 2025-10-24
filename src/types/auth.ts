// ---------- TYPES ----------
export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  mobileNumber?: string;
  address?: {
    streetNumber?: string;
    streetName?: string;
    postcode?: string;
    additionalInstructions?: string;
  };
  role?: "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";
};

export type AuthResponse = {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
};

export interface Address {
  id: string;
  streetNumber?: string;
  streetName?: string;
  postcode?: string;
  additionalInstructions?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";
  fullName?: string;
  mobileNumber?: string;
  restaurantId?: string;
  branchId?: string;
  addresses: Address[];
}
