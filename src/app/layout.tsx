import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AnalyticsScripts } from "@/components/shared/AnalyticsScripts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jewel Avenue — Premium Handcrafted Jewellery",
  description: "Discover exquisite handcrafted jewellery at Jewel Avenue. Premium diamond rings, earrings, bracelets, pendants and more. Shop luxury jewellery online in India.",
  keywords: ["jewellery", "diamond rings", "gold jewellery", "luxury jewellery", "handcrafted", "Jewel Avenue", "India"],
  openGraph: {
    title: "Jewel Avenue — Premium Handcrafted Jewellery",
    description: "Discover exquisite handcrafted jewellery. Premium diamond rings, earrings, bracelets and more.",
    siteName: "Jewel Avenue",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/balgin"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black">
        <CartProvider>{children}</CartProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
