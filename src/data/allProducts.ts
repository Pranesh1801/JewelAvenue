import { rings } from "./rings";
import { earrings } from "./earrings";
import { bracelets } from "./bracelets";
import { pendants } from "./pendants";
import { Product } from "./types";

// Single source of truth for all products across every category.
// Add new category arrays here — bestsellers auto-update everywhere.
export const allProducts: Product[] = [
  ...rings,
  ...earrings,
  ...bracelets,
  ...pendants,
];

// Automatically derived — never manually maintained.
export const bestsellerProducts: Product[] = allProducts.filter(
  (p) => p.bestseller === true
);
