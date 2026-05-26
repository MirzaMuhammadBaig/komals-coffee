import {
  LayoutDashboard,
  ShoppingBag,
  Coffee,
  Tag,
  Sparkles,
  Store,
  FolderTree,
  Star,
  Mail,
  Megaphone,
  Gauge,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type AdminNavSection = {
  heading: string;
  items: AdminNavItem[];
};

export const adminNavSections: AdminNavSection[] = [
  {
    heading: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/revenue", label: "Revenue", icon: TrendingUp },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    ],
  },
  {
    heading: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Coffee },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/deals", label: "Deals", icon: Sparkles },
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
    ],
  },
  {
    heading: "Engagement",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/messages", label: "Messages", icon: Mail },
    ],
  },
  {
    heading: "Configuration",
    items: [
      { href: "/admin/store", label: "Store status", icon: Store },
      {
        href: "/admin/announcement",
        label: "Announcement",
        icon: Megaphone,
      },
      { href: "/admin/busyness", label: "Busyness", icon: Gauge },
    ],
  },
];
