"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiMail,
  FiSettings,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";

const menuItems = [
  {
    title: "Dashboard",
    icon: FiHome,
    path: "/dashboard",
  },
  {
    title: "Customers",
    icon: FiUsers,
    path: "/dashboard/customers",
  },
  {
    title: "Orders",
    icon: FiShoppingCart,
    path: "/dashboard/orders",
    submenu: [
      {
        title: "All Orders",
        path: "/dashboard/orders",
      },
      {
        title: "Order Campaigns",
        path: "/dashboard/orders/campaign",
      },
    ],
  },
  {
    title: "Campaigns",
    icon: FiMail,
    path: "/dashboard/campaigns",
  },
  {
    title: "Analytics",
    icon: FiBarChart2,
    path: "/dashboard/analytics",
  },
  {
    title: "Calendar",
    icon: FiCalendar,
    path: "/dashboard/calendar",
  },
  {
    title: "Settings",
    icon: FiSettings,
    path: "/dashboard/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600">CRM</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <div key={item.path}>
            <Link
              href={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                pathname === item.path ? "bg-gray-100 border-r-4 border-indigo-600" : ""
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.title}</span>
            </Link>
            {item.submenu && (
              <div className="ml-6">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.path}
                    href={subItem.path}
                    className={`block px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 ${
                      pathname === subItem.path ? "bg-gray-100 border-r-4 border-indigo-600" : ""
                    }`}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 