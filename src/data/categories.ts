export interface Category {
  id: string;
  title: string;
  tagline: string;
  href?: string;
  iconType: string; // To identify which icon to use
}

export const categories: Category[] = [
  // Row 1
  {
    id: "rings",
    title: "Rings",
    tagline: "Crafted for timeless elegance",
    href: "/collections/rings",
    iconType: "ring",
  },
  {
    id: "earrings",
    title: "Earrings",
    tagline: "Delicate brilliance in every detail",
    iconType: "earrings",
  },
  {
    id: "bracelets",
    title: "Bracelets",
    tagline: "Refined beauty for every moment",
    iconType: "bracelet",
  },
  // Row 2
  {
    id: "jhumkas",
    title: "Jhumkas",
    tagline: "Traditional elegance, reimagined",
    iconType: "jhumkas",
  },
  {
    id: "pendants",
    title: "Pendants",
    tagline: "Meaning in every detail",
    iconType: "pendants",
  },
  {
    id: "bangles",
    title: "Bangles",
    tagline: "Grace in every movement",
    iconType: "bangles",
  },
  // Row 3
  {
    id: "bars",
    title: "Gold & Silver Bars",
    tagline: "Luxury you can hold",
    iconType: "bars",
  },
];