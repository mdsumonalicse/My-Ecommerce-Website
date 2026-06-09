export type Page = 'home' | 'product-detail' | 'cart' | 'checkout' | 'user-dashboard' | 'admin-dashboard';

export interface Product {
  id: string;
  title: string;
  banglaTitle: string;
  category: string;
  price: number; // in BDT
  originalPrice: number; // in BDT
  discount: number; // percentage (e.g. 20 for 20%)
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  sold: number;
  isFlashSale: boolean;
  isTrending: boolean;
  description: string;
  banglaDescription: string;
  specifications: Record<string, string>;
  banglaSpecifications: Record<string, string>;
  sizes?: string[];
  colors?: { name: string; class: string }[];
  brand: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  shippingAddress: {
    name: string;
    phone: string;
    district: string;
    address: string;
  };
  trackingStep: number; // 0: Received, 1: Packaging, 2: Shipped, 3: Delivered
  currentLocation?: string;
  currentLocationBn?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  rewardPoints: number;
  memberSince: string;
  avatar: string;
}

export type AdminPermission = 
  | 'super_admin'
  | 'add_products'
  | 'modify_products' // This covers add, edit, and delete
  | 'manage_orders';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  avatar: string;
  role: 'user' | 'admin' | 'super_admin';
  permissions: AdminPermission[]; // Super admins get ['super_admin'], normal admins get specific subsets e.g. ['add_products', 'manage_orders']
  password?: string;
  rewardPoints: number;
  memberSince: string;
  orders: Order[];
  cartItems: CartItem[];
  wishlist: string[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  banglaComment: string;
  verified: boolean;
}
