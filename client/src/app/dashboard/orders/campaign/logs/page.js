"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderCampaignLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders/campaign_logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        setError("Failed to fetch campaign logs");
      }
    } catch (err) {
      setError("Error fetching campaign logs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Order Campaign Logs</h1>
        <Link href="/dashboard/customers/campaign/logs">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">View Customer Campaign Logs</button>
        </Link>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && !error && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left">Campaign ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Message</th>
                <th className="px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No campaign logs found.</td>
                </tr>
              )}
              {logs.map((log, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 font-mono text-xs">{log.campaignId}</td>
                  <td className="px-4 py-2">{log.customer}</td>
                  <td className="px-4 py-2">{log.orderId}</td>
                  <td className="px-4 py-2 text-sm">{log.message}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 