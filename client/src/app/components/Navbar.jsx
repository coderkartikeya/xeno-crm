'use client';
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/90 dark:bg-gray-950/90 border-b border-blue-100 dark:border-blue-900/30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
            FlowCrm
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-8">
            <a className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium" href="#features">Features</a>
            <a className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium" href="#testimonials">Testimonials</a>
            <a className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium" href="#pricing">Pricing</a>
          </nav>
          
          
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
} 