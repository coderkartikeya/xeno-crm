"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Campaigns", href: "/dashboard/campaigns" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Orders Campagins", href: "/dashboard/orders/campaign" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-full w-56 bg-gradient-to-b from-blue-950 to-purple-950 dark:from-gray-900 dark:to-gray-950 border-r flex flex-col py-6 px-3 gap-2 shadow-md">
      <div className="text-2xl font-bold mb-8 text-blue-400">FlowCRM</div>
      {nav.map(item => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-lg font-medium
            ${pathname === item.href ? "bg-blue-600 text-white shadow" : "text-blue-200 hover:bg-blue-900/40 hover:text-white"}
          `}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
} 