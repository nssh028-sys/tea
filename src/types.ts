export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  sugar: string;
  ice: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: any;
}
