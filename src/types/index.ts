// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string | Category;
  sizes: string[];
  colors: string[];
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

// Order Types
export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  totalPrice: number;
  shippingPrice: number;
  taxPrice: number;
  itemsPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  isShipped: boolean;
  isConfirmed: boolean;
  isCancelled: boolean;
  cancelReason?: string;
  paidAt?: Date;
  deliveredAt?: Date;
  shippedAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface ShippingAddress {
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address?: string;
}

// Review Types
export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  product: string | {
    _id: string;
    name: string;
    slug: string;
    images: string[];
  };
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Search and Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Form Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// SSLCommerz Types
export interface SSLCommerzConfig {
  store_id: string;
  store_passwd: string;
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  shipping_method: string;
  num_of_item: number;
  multi_card_name?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
} 