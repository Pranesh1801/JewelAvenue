export interface Bestseller {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage: string;
}

export const bestsellers: Bestseller[] = [
  {
    id: "1",
    name: "Elegant Diamond Ring",
    price: "₹ 45,999",
    image: "/products/bestseller-1.jpg",
    hoverImage: "/products/bestseller-1-hover.jpg",
  },
  {
    id: "2",
    name: "Pearl Necklace",
    price: "₹ 32,500",
    image: "/products/bestseller-2.jpg",
    hoverImage: "/products/bestseller-2-hover.jpg",
  },
  {
    id: "3",
    name: "Gold Earrings",
    price: "₹ 28,900",
    image: "/products/bestseller-3.jpg",
    hoverImage: "/products/bestseller-3-hover.jpg",
  },
  {
    id: "4",
    name: "Sapphire Bracelet",
    price: "₹ 52,200",
    image: "/products/bestseller-4.jpg",
    hoverImage: "/products/bestseller-4-hover.jpg",
  },
  {
    id: "5",
    name: "Ruby Pendant",
    price: "₹ 38,750",
    image: "/products/bestseller-5.jpg",
    hoverImage: "/products/bestseller-5-hover.jpg",
  },
  {
    id: "6",
    name: "Silver Bangles",
    price: "₹ 25,600",
    image: "/products/bestseller-6.jpg",
    hoverImage: "/products/bestseller-6-hover.jpg",
  },
];