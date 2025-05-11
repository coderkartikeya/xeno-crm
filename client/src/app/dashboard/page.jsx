'use client';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaUsers, FaRocket, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // Send user info to backend
  useEffect(() => {
    if (session?.user) {
      
      const sendUserData = async () => {
        try {
          await fetch('/api/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            }),
          });
        } catch (error) {
          console.error('Error saving user:', error);
        }
      };
      sendUserData();
    }
  }, [session]);

  // Loading spinner
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Don't render anything while redirecting
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 w-full">
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <DashboardCard icon={<FaUsers />} title="Total Customers" value={"2,340"} color="indigo" />
            <DashboardCard icon={<FaRocket />} title="Campaigns Run" value={"18"} color="green" />
            <DashboardCard icon={<FaChartBar />} title="Last Campaign Delivery" value={"92%"} color="yellow" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 px-8 py-4 bg-indigo-600 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition"
            onClick={() => router.push('/segments')}
          >
            + Create New Segment
          </motion.button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
              <div className="text-gray-500 dark:text-gray-400">Recent customer activities will appear here.</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Campaigns</h2>
              <div className="text-gray-500 dark:text-gray-400">Recent campaigns will appear here.</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
