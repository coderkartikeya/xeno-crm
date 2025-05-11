"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiPlus, FiUsers, FiMail, FiCalendar, FiBarChart2, FiDownload, FiUpload, FiFilter, FiX } from "react-icons/fi";
import { ShoppingCart, Send, Zap, Clock, Tag, BarChart, Check, X, Database, Search, UserPlus, FileText, ExternalLink } from 'lucide-react';
import _ from 'lodash';

export default function CustomersPage() {
  // State for customers, segments, and campaigns
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('name');
  const [apiLink, setApiLink] = useState('');
  
  // Campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  
  // Segmentation filters
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('all');
  const [location, setLocation] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState('');
  const [naturalLanguageFilter, setNaturalLanguageFilter] = useState('');
  
  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState();

  // Fetch customers from Redis on component mount
  useEffect(() => {
    fetchCustomers();
    fetchCampaigns();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/save-customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
        setFilteredCustomers(data.customers || []);
      } else {
        console.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch campaign history
  const fetchCampaigns = async () => {
    const response = await fetch('/api/campaigns');
    if (response.ok) {
      const data = await response.json();
      setCampaigns(data);
    } else {
      console.error('Failed to fetch campaigns');
    }
  };

  // Handle CSV upload
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const response = await fetch('/api/save-customers', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
        setFilteredCustomers(data.customers || []);
      } else {
        console.error('Failed to upload CSV');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch from API link
  const fetchFromApiLink = async () => {
    if (!apiLink) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/customers/import-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiLink }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setFilteredCustomers(data.customers);
      } else {
        console.error('Failed to fetch from API');
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['name', 'email', 'totalSpend', 'loyaltyPoints', 'visits'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => 
        headers.map(header => customer[header]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
  };

  // Apply segmentation filters
  const applyFilters = () => {
    let result = [...customers];
    
    // Apply age filter
    if (ageRange !== '') {
      const [min, max] = ageRange.split('-').map(Number);
      result = result.filter(customer => 
        customer.age >= min && customer.age <= max
      );
    }
    
    // Apply gender filter
    if (gender !== 'all') {
      result = result.filter(customer => customer.gender === gender);
    }
    
    // Apply location filter
    if (location !== '') {
      result = result.filter(customer => 
        customer.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Apply purchase history filter
    if (purchaseHistory !== '') {
      result = result.filter(customer => 
        customer.purchaseHistory.toLowerCase().includes(purchaseHistory.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return a.age - b.age;
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });
    
    setFilteredCustomers(result);
  };

  // Reset all filters
  const resetFilters = () => {
    setAgeRange('');
    setGender('all');
    setLocation('');
    setPurchaseHistory('');
    setNaturalLanguageFilter('');
    setSortOption('name');
    setFilteredCustomers(customers);
  };

  // Process natural language query to segment rules
  const processNaturalLanguageFilter = async () => {
    if (!naturalLanguageFilter.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers/segment/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: naturalLanguageFilter }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Apply the returned filter rules
        setAgeRange(data.ageRange || '');
        setGender(data.gender || 'all');
        setLocation(data.location || '');
        setPurchaseHistory(data.purchaseHistory || '');
        
        // Apply filters with new rules
        let result = [...customers];
        
        if (data.ageRange) {
          const [min, max] = data.ageRange.split('-').map(Number);
          result = result.filter(customer => 
            customer.age >= min && customer.age <= max
          );
        }
        
        if (data.gender !== 'all') {
          result = result.filter(customer => customer.gender === data.gender);
        }
        
        if (data.location) {
          result = result.filter(customer => 
            customer.location.toLowerCase().includes(data.location.toLowerCase())
          );
        }
        
        if (data.purchaseHistory) {
          result = result.filter(customer => 
            customer.purchaseHistory.toLowerCase().includes(data.purchaseHistory.toLowerCase())
          );
        }
        
        setFilteredCustomers(result);
      }
    } catch (error) {
      console.error('Error processing natural language filter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get AI suggestions for the campaign
  const getAiSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignName,
          targetAudience,
          segmentStats: [
            {
              demographic: 'customer segment',
              engagementRate: 75,
              totalCustomers: filteredCustomers.length,
              ageDistribution: _.countBy(filteredCustomers, 'age'),
              genderDistribution: _.countBy(filteredCustomers, 'gender'),
              locationDistribution: _.countBy(filteredCustomers, 'location')
            }
          ]
        }),
      });
      
      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions(suggestions);
        setShowAiPanel(true);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a message suggestion
  const selectMessageSuggestion = (message) => {
    setCampaignMessage(message);
  };

  // Create and launch campaign
  const launchCampaign = async () => {
    if (!campaignName || !campaignMessage || filteredCustomers.length === 0) {
      alert('Please provide campaign name, message and select customers');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName,
          targetAudience: targetAudience || `Customer Segment (${filteredCustomers.length} customers)`,
          message: campaignMessage,
          customers: filteredCustomers.map(c => ({ id: c.id, name: c.name, email: c.email })),
          tag: aiSuggestions?.campaignTag || 'Customer Campaign',
          scheduledTime: aiSuggestions?.scheduleSuggestion || new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        // Reset form
        setCampaignName('');
        setTargetAudience('');
        setCampaignMessage('');
        setShowSegmentation(false);
        setShowAiPanel(false);
        
        // Refresh campaigns
        fetchCampaigns();
        
        alert('Campaign launched successfully!');
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('Failed to launch campaign');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate campaign performance metrics
  const getCampaignPerformance = (campaign) => {
    const deliveryRate = (campaign.delivered / (campaign.delivered + campaign.failed)) * 100;
    return {
      deliveryRate: deliveryRate.toFixed(1),
      successText: `Your campaign reached ${campaign.delivered + campaign.failed} customers. ${campaign.delivered} messages were delivered.`,
    };
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <FiUsers className="mr-2" size={24} /> Customer Management
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white dark:bg-gray-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FiFilter size={18} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white dark:bg-gray-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FiDownload size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-semibold">{customers.length}</p>
              </div>
              <FiUsers className="text-blue-500" size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Campaigns</p>
                <p className="text-2xl font-semibold">{campaigns.filter(c => c.status === 'In Progress').length}</p>
              </div>
              <FiMail className="text-green-500" size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Engagement</p>
                <p className="text-2xl font-semibold">75%</p>
              </div>
              <FiBarChart2 className="text-purple-500" size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Filtered Customers</p>
                <p className="text-2xl font-semibold">{filteredCustomers.length}</p>
              </div>
              <FiFilter className="text-orange-500" size={24} />
            </div>
          </motion.div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age Range</label>
                <input
                  type="text"
                  placeholder="e.g., 18-30"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., New York"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="name">Name</option>
                  <option value="age">Age</option>
                  <option value="location">Location</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Data Import Section */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Import Customers</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiUpload size={18} />
                  Choose CSV File
                </label>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Import from API</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter API endpoint"
                  value={apiLink}
                  onChange={(e) => setApiLink(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                />
                <button
                  onClick={fetchFromApiLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <ExternalLink size={18} />
                  Fetch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Spend
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Loyalty Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {filteredCustomers.map((customer) => (
                  <motion.tr
                    key={customer.email}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-medium">
                              {customer.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">${customer.totalSpend ?? 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{customer.loyaltyPoints ?? 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{customer.visits ?? 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
} 