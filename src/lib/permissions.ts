/**
 * lib/permissions.ts
 * Central permission matrix for admin roles.
 * MARKETING role removed — marketing team uses native Shopify Admin dashboard.
 * All admin panel access is ADMIN-only.
 */

export type AdminRole = "ADMIN";

/** Returns true if the given role can access the given admin section */
export function canAccess(
  role: string | undefined,
  section: "products" | "categories" | "orders" | "users" | "reports" | "dashboard" | "settings"
): boolean {
  if (role === "ADMIN") return true;
  // Only ADMIN has access to the custom admin panel
  // MARKETING team uses Shopify admin at {store}.myshopify.com/admin
  void section; // all sections are ADMIN-only
  return false;
}

/** Returns true if role can mutate (create/edit/delete) products */
export function canMutateProducts(role: string | undefined): boolean {
  return role === "ADMIN";
}

/** Returns true if role can manage categories */
export function canManageCategories(role: string | undefined): boolean {
  return role === "ADMIN";
}

/** Returns true if role can view/manage orders */
export function canViewOrders(role: string | undefined): boolean {
  return role === "ADMIN";
}

/** Returns true if role can view/manage users */
export function canViewUsers(role: string | undefined): boolean {
  return role === "ADMIN";
}

/** Returns true if role can view dashboard stats */
export function canViewStats(role: string | undefined): boolean {
  return role === "ADMIN";
}

/** Returns true if role can view reports/analytics */
export function canViewReports(role: string | undefined): boolean {
  return role === "ADMIN";
}

/** Sidebar nav items — ADMIN only, no role filtering needed */
export function getNavItemsForRole(role: string | undefined) {
  const all = [
    { label: "Dashboard", href: "/admin", icon: "📊", section: "dashboard" },
    { label: "Products", href: "/admin/products", icon: "💎", section: "products" },
    { label: "Categories", href: "/admin/categories", icon: "📁", section: "categories" },
    { label: "Orders", href: "/admin/orders", icon: "📦", section: "orders" },
    { label: "Reports", href: "/admin/reports", icon: "📈", section: "reports" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️", section: "settings" },
  ] as const;

  return all.filter((item) => canAccess(role, item.section));
}
