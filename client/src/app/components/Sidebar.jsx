import { FaUsers, FaChartBar, FaRocket, FaRobot, FaTools } from 'react-icons/fa';
import Link from 'next/link';

const nav = [
  { label: 'Segments', icon: <FaUsers />, href: '/segments' },
  { label: 'Campaigns', icon: <FaChartBar />, href: '/campaigns' },
  { label: 'Create Campaign', icon: <FaRocket />, href: '/create-campaign' },
  { label: 'AI Suggestions', icon: <FaRobot />, href: '/ai' },
  { label: 'Admin', icon: <FaTools />, href: '/admin' },
];

export default function Sidebar() {
  return (
    <aside className="h-full w-56 bg-white dark:bg-gray-900 border-r flex flex-col py-6 px-3 gap-2 shadow-md">
      <div className="text-2xl font-bold mb-8 text-indigo-600">MiniCRM</div>
      {nav.map(item => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-indigo-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200 font-medium"
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  );
} 