import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Existing data from src/data/ ────────────────────────────────────────────

const categoriesData = [
  { slug: "rings", title: "Rings", tagline: "Crafted for timeless elegance", iconType: "ring", href: "/collections/rings", sortOrder: 0 },
  { slug: "earrings", title: "Earrings", tagline: "Delicate brilliance in every detail", iconType: "earrings", href: "/collections/earrings", sortOrder: 1 },
  { slug: "bracelets", title: "Bracelets", tagline: "Refined beauty for every moment", iconType: "bracelet", href: "/collections/bracelets", sortOrder: 2 },
  { slug: "jhumkas", title: "Jhumkas", tagline: "Traditional elegance, reimagined", iconType: "jhumkas", href: "/collections/jhumkas", sortOrder: 3 },
  { slug: "pendants", title: "Pendants", tagline: "Meaning in every detail", iconType: "pendants", href: "/collections/pendants", sortOrder: 4 },
  { slug: "bangles", title: "Bangles", tagline: "Grace in every movement", iconType: "bangles", href: "/collections/bangles", sortOrder: 5 },
  { slug: "bars", title: "Gold & Silver Bars", tagline: "Luxury you can hold", iconType: "bars", href: "/collections/bars", sortOrder: 6 },
];

function parsePriceToInt(priceStr: string): number {
  return Math.round(parseFloat(priceStr.replace(/[^0-9.]/g, "")) * 100);
}

interface ProductSeed {
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
  bestseller?: boolean;
  carousel?: string[];
  customizations?: { metal: string[]; size: string[]; finish: string[] };
}

const ringsData: ProductSeed[] = [
  {
    name: "Solitaire Diamond Ring", price: "₹24,999", image: "/products/ring-1.jpg", hoverImage: "/products/ring-1-hover.jpg",
    subtitle: "IGI CERTIFIED", description: "Elegant handcrafted premium ring.", styleCode: "ALR16379",
    goldWeight: "1.649 g", netWeight: "2.000 g", diamondCount: "30", diamondWeight: "0.244 ct", purity: "14K Gold",
    bestseller: true, carousel: ["/products/ring-1.jpg", "/products/ring-1-hover.jpg"],
    customizations: { metal: ["9K Gold", "14K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Emerald Elegance", price: "₹38,500", image: "/products/ring-2.jpg", hoverImage: "/products/ring-2-hover.jpg",
    subtitle: "Certified Silver", description: "Luxury emerald ring with polished finish.", styleCode: "EMD27491",
    goldWeight: "1.520 g", netWeight: "1.485 g", diamondCount: "24", diamondWeight: "0.192 ct", purity: "18K Gold",
    carousel: ["/products/ring-2.jpg", "/products/ring-2-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Ruby Romance", price: "₹52,200", image: "/products/ring-3.jpg", hoverImage: "/products/ring-3-hover.jpg",
    subtitle: "Premium Finish", description: "Timeless ruby ring crafted for elegance.", styleCode: "RBY39204",
    goldWeight: "1.742 g", netWeight: "1.700 g", diamondCount: "28", diamondWeight: "0.216 ct", purity: "18K Gold",
    carousel: ["/products/ring-3.jpg", "/products/ring-3-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Pearl Perfection", price: "₹28,900", image: "/products/ring-4.jpg", hoverImage: "/products/ring-4-hover.jpg",
    subtitle: "Natural Pearl", description: "Sophisticated pearl ring with clean styling.", styleCode: "PRL14583",
    goldWeight: "1.310 g", netWeight: "1.280 g", diamondCount: "12", diamondWeight: "0.108 ct", purity: "18K Gold",
    carousel: ["/products/ring-4.jpg", "/products/ring-4-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Sapphire Serenity", price: "₹48,750", image: "/products/ring-5.jpg", hoverImage: "/products/ring-5-hover.jpg",
    subtitle: "Hallmarked Blue", description: "Elegant sapphire ring designed for everyday wear.", styleCode: "SFP50827",
    goldWeight: "1.632 g", netWeight: "1.590 g", diamondCount: "26", diamondWeight: "0.208 ct", purity: "18K Gold",
    bestseller: true, carousel: ["/products/ring-5.jpg", "/products/ring-5-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Golden Crown", price: "₹61,200", image: "/products/ring-6.jpg", hoverImage: "/products/ring-6-hover.jpg",
    subtitle: "Certified Gold", description: "Bold gold ring with premium detailing.", styleCode: "GLD66312",
    goldWeight: "1.980 g", netWeight: "1.920 g", diamondCount: "36", diamondWeight: "0.260 ct", purity: "18K Gold",
    carousel: ["/products/ring-6.jpg", "/products/ring-6-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Rose Garden", price: "₹35,450", image: "/products/ring-7.jpg", hoverImage: "/products/ring-7-hover.jpg",
    subtitle: "Designer Silver", description: "Romantic ring with rose-inspired details.", styleCode: "RSG78240",
    goldWeight: "1.560 g", netWeight: "1.520 g", diamondCount: "20", diamondWeight: "0.175 ct", purity: "18K Gold",
    carousel: ["/products/ring-7.jpg", "/products/ring-7-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Vintage Charm", price: "₹42,800", image: "/products/ring-8.jpg", hoverImage: "/products/ring-8-hover.jpg",
    subtitle: "Antique Style", description: "Classic vintage ring with refined elegance.", styleCode: "VNT89165",
    goldWeight: "1.705 g", netWeight: "1.670 g", diamondCount: "22", diamondWeight: "0.188 ct", purity: "18K Gold",
    bestseller: true, carousel: ["/products/ring-8.jpg", "/products/ring-8-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
  {
    name: "Modern Minimalist", price: "₹25,600", image: "/products/ring-9.jpg", hoverImage: "/products/ring-9-hover.jpg",
    subtitle: "Contemporary Silver", description: "Sleek minimal ring for a modern wardrobe.", styleCode: "MDN93042",
    goldWeight: "1.410 g", netWeight: "1.380 g", diamondCount: "14", diamondWeight: "0.118 ct", purity: "18K Gold",
    carousel: ["/products/ring-9.jpg", "/products/ring-9-hover.jpg"],
    customizations: { metal: ["14K Gold", "18K Gold", "Silver", "Rose Gold"], size: ["6", "7", "8", "9", "10"], finish: ["Glossy", "Matte"] }
  },
];

const earringsData: ProductSeed[] = [
  {
    name: "Dewdrop Diamond Earrings", price: "₹22,600", image: "/products/ring-5.jpg", hoverImage: "/products/ring-5-hover.jpg",
    subtitle: "Hallmarked Blue", description: "Dazzling drop earrings with diamond detail.", styleCode: "EAR53014",
    goldWeight: "1.470 g", netWeight: "1.430 g", diamondCount: "16", diamondWeight: "0.134 ct", purity: "18K Gold",
  },
  {
    name: "Pearl Glow Earrings", price: "₹19,100", image: "/products/ring-6.jpg", hoverImage: "/products/ring-6-hover.jpg",
    subtitle: "Certified Gold", description: "Soft pearl earrings for everyday luxury.", styleCode: "EAR61205",
    goldWeight: "1.380 g", netWeight: "1.350 g", diamondCount: "12", diamondWeight: "0.108 ct", purity: "18K Gold",
  },
];

const braceletsData: ProductSeed[] = [
  {
    name: "Golden Link Bracelet", price: "₹29,900", image: "/products/ring-3.jpg", hoverImage: "/products/ring-3-hover.jpg",
    subtitle: "Premium Finish", description: "Statement bracelet with refined craftsmanship.", styleCode: "BRL30782",
    goldWeight: "2.180 g", netWeight: "2.120 g", diamondCount: "18", diamondWeight: "0.164 ct", purity: "18K Gold",
    bestseller: true,
  },
  {
    name: "Sapphire Twist Bracelet", price: "₹33,450", image: "/products/ring-4.jpg", hoverImage: "/products/ring-4-hover.jpg",
    subtitle: "Natural Sapphire", description: "Elegant bracelet with sapphire highlights.", styleCode: "BRL41290",
    goldWeight: "2.350 g", netWeight: "2.280 g", diamondCount: "22", diamondWeight: "0.192 ct", purity: "18K Gold",
  },
];

const pendantsData: ProductSeed[] = [
  {
    name: "Lustrous Pearl Pendant", price: "₹16,800", image: "/products/ring-1.jpg", hoverImage: "/products/ring-1-hover.jpg",
    subtitle: "Hallmarked Gold", description: "Delicate pendant with pearl accent.", styleCode: "PND10425",
    goldWeight: "1.120 g", netWeight: "1.090 g", diamondCount: "8", diamondWeight: "0.072 ct", purity: "18K Gold",
  },
  {
    name: "Crystal Harmony Pendant", price: "₹18,400", image: "/products/ring-2.jpg", hoverImage: "/products/ring-2-hover.jpg",
    subtitle: "Certified Silver", description: "Elegant pendant with hand-set crystals.", styleCode: "PND20531",
    goldWeight: "1.230 g", netWeight: "1.200 g", diamondCount: "10", diamondWeight: "0.088 ct", purity: "18K Gold",
  },
];

// ── Seed function ────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Jewel Avenue database...\n");

  // 1. Create categories
  console.log("📁 Creating categories...");
  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
    console.log(`   ✓ ${cat.title}`);
  }

  // 2. Create products with images and customizations
  const allProducts: { category: string; products: ProductSeed[] }[] = [
    { category: "rings", products: ringsData },
    { category: "earrings", products: earringsData },
    { category: "bracelets", products: braceletsData },
    { category: "pendants", products: pendantsData },
  ];

  for (const { category, products } of allProducts) {
    const categoryId = categoryMap.get(category);
    if (!categoryId) {
      console.error(`   ✗ Category '${category}' not found`);
      continue;
    }

    console.log(`\n📦 Creating ${category} (${products.length} products)...`);

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const priceInt = parsePriceToInt(p.price);

      const product = await prisma.product.upsert({
        where: { styleCode: p.styleCode },
        update: {
          name: p.name,
          price: priceInt,
          displayPrice: p.price,
          subtitle: p.subtitle,
          description: p.description,
          goldWeight: p.goldWeight,
          netWeight: p.netWeight,
          diamondCount: p.diamondCount,
          diamondWeight: p.diamondWeight,
          purity: p.purity,
          bestseller: p.bestseller ?? false,
          categoryId,
          sortOrder: i,
        },
        create: {
          name: p.name,
          price: priceInt,
          displayPrice: p.price,
          subtitle: p.subtitle,
          description: p.description,
          styleCode: p.styleCode,
          goldWeight: p.goldWeight,
          netWeight: p.netWeight,
          diamondCount: p.diamondCount,
          diamondWeight: p.diamondWeight,
          purity: p.purity,
          bestseller: p.bestseller ?? false,
          categoryId,
          sortOrder: i,
          stock: 100,
        },
      });

      // Delete existing images/customizations (idempotent)
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productCustomization.deleteMany({ where: { productId: product.id } });

      // Create images
      const images = p.carousel || [p.image];
      for (let j = 0; j < images.length; j++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: images[j],
            sortOrder: j,
            isHover: j === 1,
          },
        });
      }
      // Add hover image if not already in carousel
      if (!p.carousel?.includes(p.hoverImage)) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: p.hoverImage,
            sortOrder: images.length,
            isHover: true,
          },
        });
      }

      // Create customizations
      if (p.customizations) {
        for (const metal of p.customizations.metal) {
          await prisma.productCustomization.create({
            data: { productId: product.id, type: "metal", value: metal },
          });
        }
        for (const size of p.customizations.size) {
          await prisma.productCustomization.create({
            data: { productId: product.id, type: "size", value: size },
          });
        }
        for (const finish of p.customizations.finish) {
          await prisma.productCustomization.create({
            data: { productId: product.id, type: "finish", value: finish },
          });
        }
      }

      console.log(`   ✓ ${p.name} (${p.price})`);
    }
  }

  // 3. Create admin user
  console.log("\n👤 Creating admin user...");
  const adminHash = await bcrypt.hash("JewelAdmin2026!", 12);
  await prisma.user.upsert({
    where: { email: "admin@jewelavenue.in" },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      email: "admin@jewelavenue.in",
      name: "Jewel Avenue Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("   ✓ admin@jewelavenue.in (password: JewelAdmin2026!)");

  // 4. Create marketing user
  const marketingHash = await bcrypt.hash("JewelMarketing2026!", 12);
  await prisma.user.upsert({
    where: { email: "marketing@jewelavenue.in" },
    update: { passwordHash: marketingHash, role: "MARKETING" },
    create: {
      email: "marketing@jewelavenue.in",
      name: "Marketing Team",
      passwordHash: marketingHash,
      role: "MARKETING",
    },
  });
  console.log("   ✓ marketing@jewelavenue.in (password: JewelMarketing2026!)");

  console.log("\n✅ Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
