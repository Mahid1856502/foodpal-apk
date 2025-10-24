export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
  isRequired: boolean;
  foodItemId: string;
  quantity: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  image: string;
  ingredients: string[];
  allergens: string[];
  isAvailable: boolean;
  addOns: AddOn[];
}

export interface MenuResponse {
  restaurantId: string;
  restaurantName: string;
  foodItems: FoodItem[];
}
