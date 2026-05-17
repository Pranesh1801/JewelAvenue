export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  hoverImage: string;
  subtitle: string;
  description: string;
  styleCode: string;
  goldWeight: string;
  netWeight: string;
  diamondCount: string;
  diamondWeight: string;
  purity: string;
  carousel?: string[];
  customizations?: {
    metal: string[];
    size: string[];
    finish: string[];
  };
  bestseller?: boolean;
  stock?: number;
  category?: string;
}

export interface CartItem {
  id: string;
  productId: number;
  title: string;
  price: string;
  image: string;
  quantity: number;
  category?: string;
  purity?: string;
  variant?: string;
  bestseller?: boolean;
}
