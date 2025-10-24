// src/types/branch.ts
export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  email?: string;
  postcode?: string;
  isActive: boolean;
  openingHours?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  restaurantId: string;
  deliveryPostcodes: string[];
}

export interface NearbyBranch extends Branch {
  distance?: number;
}
