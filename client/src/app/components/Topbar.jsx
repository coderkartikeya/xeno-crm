'use client';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

export default function Topbar() {
  // const { theme, setTheme } = useTheme();
  // Dummy user
  // In a real application, you would fetch this from your authentication provider
  const { data: session } = useSession();

  const user = session?.user

  return (
    <header className="w-full flex items-center justify-end gap-4 px-6 py-4 border-b bg-white dark:bg-gray-900">
      
      <span className="font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
      <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border" />
      <button className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={()=>{
        signOut({ callbackUrl: '/' });
      }}
      >Logout</button>
    </header>
  );
} 