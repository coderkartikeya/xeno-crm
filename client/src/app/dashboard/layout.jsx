"use client";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
} 