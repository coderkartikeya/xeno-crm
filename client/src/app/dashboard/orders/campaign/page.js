"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiPlus, FiUsers, FiMail, FiCalendar, FiBarChart2, FiDownload, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { Filter, ShoppingCart, Send, Zap, Clock, Tag, BarChart, Check, X, Database, Search } from 'lucide-react';
import _ from 'lodash';
import { Bar } from 'react-chartjs-2';

export default function OrderCampaignsPage() {
  // State for orders, segments, and campaigns
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  // Campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  
  // Segmentation filters
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [orderDateRange, setOrderDateRange] = useState('');
  const [naturalLanguageFilter, setNaturalLanguageFilter] = useState('');
  
  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState();

  const [productStats, setProductStats] = useState([]);
  const [error, setError] = useState(null);

  // Fetch orders from Redis on component mount
  useEffect(() => {
    fetchOrders();
    fetchCampaigns();
    fetchProductStats();
  }, []);

  // Fetch orders from Redis
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders/redis');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch campaign history
  const fetchCampaigns = async () => {
    const response = await fetch('/api/orders/campaigns');
    if (response.ok) {
      const data = await response.json();
      setCampaigns(data);
    } else {
      console.error('Failed to fetch campaigns');
    }
  };

  const fetchProductStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/products-stats');
      if (response.ok) {
        const data = await response.json();
        setProductStats(data.products || []);
      } else {
        setError('Failed to fetch product stats');
      }
    } catch (err) {
      setError('Error fetching product stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply segmentation filters
  const applyFilters = () => {
    let result = [...orders];
    
    // Apply amount filters
    if (minAmount !== '') {
      result = result.filter(order => order.amount >= parseFloat(minAmount));
    }
    
    if (maxAmount !== '') {
      result = result.filter(order => order.amount <= parseFloat(maxAmount));
    }
    
    // Apply status filter
    if (orderStatus !== 'all') {
      result = result.filter(order => order.status === orderStatus);
    }
    
    // Apply date range filter
    if (orderDateRange !== '') {
      const days = parseInt(orderDateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= cutoffDate;
      });
    }
    
    setFilteredOrders(result);
  };

  // Reset all filters
  const resetFilters = () => {
    setMinAmount('');
    setMaxAmount('');
    setOrderStatus('all');
    setOrderDateRange('');
    setNaturalLanguageFilter('');
    setFilteredOrders(orders);
  };

  // Process natural language query to segment rules
  const processNaturalLanguageFilter = async () => {
    if (!naturalLanguageFilter.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders/segment/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: naturalLanguageFilter }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Apply the returned filter rules
        setMinAmount(data.minAmount || '');
        setMaxAmount(data.maxAmount || '');
        setOrderStatus(data.orderStatus || 'all');
        setOrderDateRange(data.orderDateRange || '');
        
        // Apply filters with new rules
        let result = [...orders];
        
        if (data.minAmount) {
          result = result.filter(order => order.amount >= parseFloat(data.minAmount));
        }
        
        if (data.maxAmount) {
          result = result.filter(order => order.amount <= parseFloat(data.maxAmount));
        }
        
        if (data.orderStatus !== 'all') {
          result = result.filter(order => order.status === data.orderStatus);
        }
        
        if (data.orderDateRange) {
          const days = parseInt(data.orderDateRange);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          
          result = result.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= cutoffDate;
          });
        }
        
        setFilteredOrders(result);
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
      const response = await fetch('/api/orders/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignName,
          targetAudience,
          segmentStats: [
            {
              demographic: 'order segment',
              avgOrderValue: _.meanBy(filteredOrders, 'amount'),
              totalOrders: filteredOrders.length,
              statusDistribution: _.countBy(filteredOrders, 'status'),
              dateRange: orderDateRange
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
    if (!campaignName || !campaignMessage || filteredOrders.length === 0) {
      alert('Please provide campaign name, message and select orders');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/orders/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName,
          targetAudience: targetAudience || `Order Segment (${filteredOrders.length} orders)`,
          message: campaignMessage,
          orders: filteredOrders.map(o => ({ id: o.id, customer: o.customer, amount: o.amount })),
          tag: aiSuggestions?.campaignTag || 'Order Campaign',
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
        
        alert('Order campaign launched successfully!');
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
      successText: `Your campaign reached ${campaign.delivered + campaign.failed} orders. ${campaign.delivered} messages were delivered.`,
    };
  };

  // Identify top and low sellers
  const sorted = [...productStats].sort((a, b) => b.totalPurchased - a.totalPurchased);
  const topCount = Math.ceil(sorted.length * 0.2);
  const lowCount = Math.ceil(sorted.length * 0.2);
  const topSellers = sorted.slice(0, topCount).map(p => p.productName);
  const lowSellers = sorted.slice(-lowCount).map(p => p.productName);

  // Chart data
  const chartData = {
    labels: productStats.map(p => p.productName),
    datasets: [
      {
        label: 'Total Purchased',
        data: productStats.map(p => p.totalPurchased),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Total Revenue',
        data: productStats.map(p => p.totalRevenue),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
    ],
  };

  const handleCampaign = (type) => {
    // Placeholder for launching campaign logic
    alert(`Launching campaign for ${type === 'low' ? 'low-selling' : 'top-selling'} products!`);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
          <ShoppingCart className="mr-2" size={24} /> Order Campaign Management
        </h1>
        
        {/* New Campaign Section */}
        <div className="mb-8 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="mr-2" size={20} /> Create New Order Campaign
          </h2>
          
          {/* Campaign Basic Info */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <input 
                  className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Order Follow-up Campaign"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience Label</label>
                <input 
                  className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="High-Value Orders"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Campaign Message</label>
              <textarea 
                className="border dark:border-gray-700 rounded-md px-3 py-2 w-full h-24 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                placeholder="Thank you for your order! Your items will be shipped soon."
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
                onClick={() => setShowSegmentation(!showSegmentation)}
              >
                <Filter className="mr-1" size={18} /> {showSegmentation ? 'Hide Segmentation' : 'Segment Orders'}
              </button>
              
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
                onClick={getAiSuggestions}
                disabled={isLoading}
              >
                <Zap className="mr-1" size={18} /> Get AI Suggestions
              </button>
              
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors ml-auto"
                onClick={launchCampaign}
                disabled={isLoading || !campaignName || !campaignMessage || filteredOrders.length === 0}
              >
                <Send className="mr-1" size={18} /> Launch Campaign
              </button>
            </div>
          </div>
          
          {/* Order Segmentation */}
          {showSegmentation && (
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <ShoppingCart className="mr-2" size={18} /> Order Segmentation
              </h3>
              
              {/* Natural Language Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Natural Language Filter</label>
                <div className="flex gap-2">
                  <input 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 flex-1 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="Orders over $500 from the last 30 days"
                    value={naturalLanguageFilter}
                    onChange={(e) => setNaturalLanguageFilter(e.target.value)}
                  />
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
                    onClick={processNaturalLanguageFilter}
                    disabled={isLoading || !naturalLanguageFilter.trim()}
                  >
                    <Search className="mr-1" size={18} /> Process
                  </button>
                </div>
              </div>
              
              {/* Manual Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Amount ($)</label>
                  <input 
                    type="number" 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="100"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Max Amount ($)</label>
                  <input 
                    type="number" 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="1000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Order Status</label>
                  <select 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    <option value="all">All Orders</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Last X Days</label>
                  <input 
                    type="number" 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="30"
                    value={orderDateRange}
                    onChange={(e) => setOrderDateRange(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex mb-4 gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
                  onClick={applyFilters}
                >
                  <Filter className="mr-1" size={18} /> Apply Filters
                </button>
                
                <button
                  className="border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md font-medium flex items-center transition-colors"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
              
              {/* Order Segment Preview */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Segment Preview</h4>
                  <span className="text-sm">{filteredOrders.length} orders selected</span>
                </div>
                
                <div className="border dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredOrders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">{order.id}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">{order.customer}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">${order.amount.toFixed(2)}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredOrders.length > 5 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-2 text-sm text-center text-gray-500 dark:text-gray-400">
                              ... and {filteredOrders.length - 5} more orders
                            </td>
                          </tr>
                        )}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                              No orders match the current filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI Suggestions Panel */}
          {showAiPanel && (
            <div className="border-t dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Zap className="mr-2" size={18} /> AI Suggestions
              </h3>

              {/* Campaign Summary */}
              {aiSuggestions?.campaignSummary && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Campaign Summary</h4>
                  <p className="text-sm">{aiSuggestions.campaignSummary}</p>
                </div>
              )}

              {/* Message Templates */}
              {aiSuggestions?.messageTemplates && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Message Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiSuggestions.messageTemplates.map((template, index) => (
                      <div
                        key={index}
                        className="p-3 border dark:border-gray-700 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => selectMessageSuggestion(template)}
                      >
                        <p className="text-sm">{template}</p>
                        <button className="mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                          Use This Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Suggestions */}
              {aiSuggestions?.additionalSuggestions && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {aiSuggestions.additionalSuggestions.scheduleSuggestion && (
                    <div className="p-4 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900">
                      <div className="flex items-center text-sm font-medium mb-2">
                        <Clock className="mr-2" size={16} /> Best Time to Send
                      </div>
                      <p className="text-sm">{aiSuggestions.additionalSuggestions.scheduleSuggestion}</p>
                    </div>
                  )}

                  {aiSuggestions.additionalSuggestions.audienceSuggestion && (
                    <div className="p-4 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900">
                      <div className="flex items-center text-sm font-medium mb-2">
                        <ShoppingCart className="mr-2" size={16} /> Similar Orders
                      </div>
                      <p className="text-sm">{aiSuggestions.additionalSuggestions.audienceSuggestion}</p>
                    </div>
                  )}

                  {aiSuggestions.additionalSuggestions.campaignTag && (
                    <div className="p-4 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900">
                      <div className="flex items-center text-sm font-medium mb-2">
                        <Tag className="mr-2" size={16} /> Campaign Type
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {aiSuggestions.additionalSuggestions.campaignTag}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Campaign History Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart className="mr-2" size={20} /> Campaign History
          </h2>
          
          {campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Audience</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tag</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {campaigns.map((campaign) => {
                    const performance = getCampaignPerformance(campaign);
                    return (
                      <tr key={campaign.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {campaign.status === 'Completed' ? (
                              <span className="flex items-center">
                                <Check size={14} className="text-green-500 mr-1" /> Completed
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Clock size={14} className="text-blue-500 mr-1" /> In Progress
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{campaign.targetAudience}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(campaign.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {campaign.tag || 'Order Campaign'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${performance.deliveryRate}%` }}
                                ></div>
                              </div>
                              <span>{performance.deliveryRate}%</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {campaign.delivered} delivered / {campaign.failed} failed
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Database className="mx-auto mb-2" size={24} />
              <p>No order campaigns have been created yet.</p>
            </div>
          )}
          
          {/* AI Performance Summary */}
          {campaigns.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
              <h3 className="text-sm font-medium mb-2 flex items-center text-blue-800 dark:text-blue-300">
                <Zap className="mr-1" size={16} /> AI Campaign Performance Summary
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your order campaigns have reached a total of {campaigns.reduce((sum, campaign) => sum + campaign.delivered + campaign.failed, 0)} orders. Overall delivery success rate is {((campaigns.reduce((sum, campaign) => sum + campaign.delivered, 0) / campaigns.reduce((sum, campaign) => sum + campaign.delivered + campaign.failed, 0)) * 100).toFixed(1)}%. 
                High-value orders had a higher engagement rate. Consider scheduling your next campaign during business hours for optimal results.
              </p>
            </div>
          )}
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