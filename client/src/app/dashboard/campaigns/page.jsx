'use client';
import { useState, useEffect } from 'react';
import { Filter, Users, Send, Zap, Clock, Tag, BarChart, Check, X, Database, Search } from 'lucide-react';
import _ from 'lodash';

export default function CampaignsPage() {
  // State for customers, segments, and campaigns
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  // Campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  
  // Segmentation filters
  const [minSpend, setMinSpend] = useState('');
  const [maxSpend, setMaxSpend] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [inactivityPeriod, setInactivityPeriod] = useState('');
  const [naturalLanguageFilter, setNaturalLanguageFilter] = useState('');
  
  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState();

  // Fetch customers from Redis on component mount
  useEffect(() => {
    fetchCustomers();
    fetchCampaigns();
  }, []);

  // Fetch customers from Redis
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/save-customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setFilteredCustomers(data.customers);
        
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

  // Apply segmentation filters
  const applyFilters = () => {
    let result = [...customers];
    
    // Apply spend filters
    if (minSpend !== '') {
      result = result.filter(customer => customer.totalSpend >= parseInt(minSpend));
    }
    
    if (maxSpend !== '') {
      result = result.filter(customer => customer.totalSpend <= parseInt(maxSpend));
    }
    
    // Apply active status filter
    if (activeStatus !== 'all') {
      const isActive = activeStatus === 'active';
      result = result.filter(customer => customer.active === isActive);
    }
    
    // Apply inactivity period filter
    if (inactivityPeriod !== '') {
      const months = parseInt(inactivityPeriod);
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);
      
      result = result.filter(customer => {
        const lastPurchaseDate = new Date(customer.lastPurchase);
        return lastPurchaseDate < cutoffDate;
      });
    }
    
    setFilteredCustomers(result);
  };

  // Reset all filters
  const resetFilters = () => {
    setMinSpend('');
    setMaxSpend('');
    setActiveStatus('all');
    setInactivityPeriod('');
    setNaturalLanguageFilter('');
    setFilteredCustomers(customers);
  };

  // Process natural language query to segment rules
  const processNaturalLanguageFilter = async () => {
    if (!naturalLanguageFilter.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/segment/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: naturalLanguageFilter }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Apply the returned filter rules
        setMinSpend(data.minSpend || '');
        setMaxSpend(data.maxSpend || '');
        setActiveStatus(data.activeStatus || 'all');
        setInactivityPeriod(data.inactivityPeriod || '');
        
        // Apply filters with new rules
        let result = [...customers];
        
        if (data.minSpend) {
          result = result.filter(customer => customer.totalSpend >= parseInt(data.minSpend));
        }
        
        if (data.maxSpend) {
          result = result.filter(customer => customer.totalSpend <= parseInt(data.maxSpend));
        }
        
        if (data.activeStatus !== 'all') {
          const isActive = data.activeStatus === 'active';
          result = result.filter(customer => customer.active === isActive);
        }
        
        if (data.inactivityPeriod) {
          const months = parseInt(data.inactivityPeriod);
          const cutoffDate = new Date();
          cutoffDate.setMonth(cutoffDate.getMonth() - months);
          
          result = result.filter(customer => {
            const lastPurchaseDate = new Date(customer.lastPurchase);
            return lastPurchaseDate < cutoffDate;
          });
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
    console.log('Fetching AI suggestions...');
    console.log(campaignName, targetAudience, filteredCustomers.length, inactivityPeriod);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      
        body: JSON.stringify({
          campaignName,
          targetAudience,
          segmentStats: [
                    {
                      demographic: 'general audience', // or any meaningful label
                      engagementRate: (filteredCustomers.filter(c => c.active).length / filteredCustomers.length) * 100,
                      avgSpend: _.meanBy(filteredCustomers, 'totalSpend'),
                      totalCustomers: filteredCustomers.length,
                      inactiveMonths: inactivityPeriod
                    }
                  ]

        }),
      });
      // console.log('AI suggestions response:', response);
      
      if (response.ok) {
        const suggestions = await response.json();
        console.log(suggestions)
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
          targetAudience: targetAudience || `Segment (${filteredCustomers.length} customers)`,
          message: campaignMessage,
          customers: filteredCustomers.map(c => ({ id: c.id, name: c.name, email: c.email })),
          tag: aiSuggestions.campaignTag || 'General',
          scheduledTime: aiSuggestions.scheduleSuggestion || new Date().toISOString()
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
      successText: `Your campaign reached ${campaign.delivered + campaign.failed} users. ${campaign.delivered} messages were delivered.`,
    };
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
          <Send className="mr-2" size={24} /> Campaign Management
        </h1>
        
        {/* New Campaign Section */}
        <div className="mb-8 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="mr-2" size={20} /> Create New Campaign
          </h2>
          
          {/* Campaign Basic Info */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <input 
                  className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Summer Sale"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience Label</label>
                <input 
                  className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="High Value Customers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Campaign Message</label>
              <textarea 
                className="border dark:border-gray-700 rounded-md px-3 py-2 w-full h-24 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                placeholder="Hi {name}, here's 10% off on your next order with code SUMMER10!"
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
                onClick={() => setShowSegmentation(!showSegmentation)}
              >
                <Filter className="mr-1" size={18} /> {showSegmentation ? 'Hide Segmentation' : 'Segment Customers'}
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
                disabled={isLoading || !campaignName || !campaignMessage || filteredCustomers.length === 0}
              >
                <Send className="mr-1" size={18} /> Launch Campaign
              </button>
            </div>
          </div>
          
          {/* Customer Segmentation */}
          {showSegmentation && (
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Users className="mr-2" size={18} /> Customer Segmentation
              </h3>
              
              {/* Natural Language Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Natural Language Filter</label>
                <div className="flex gap-2">
                  <input 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 flex-1 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="People who haven't shopped in 6 months and spent over ₹5000"
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
                  <label className="block text-sm font-medium mb-1">Min Spend (₹)</label>
                  <input 
                    type="number" 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="5000"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Max Spend (₹)</label>
                  <input 
                    type="number" 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="50000"
                    value={maxSpend}
                    onChange={(e) => setMaxSpend(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Status</label>
                  <select 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    value={activeStatus}
                    onChange={(e) => setActiveStatus(e.target.value)}
                  >
                    <option value="all">All Customers</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Inactive For (Months)</label>
                  <input 
                    type="number" 
                    className="border dark:border-gray-700 rounded-md px-3 py-2 w-full dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="6"
                    value={inactivityPeriod}
                    onChange={(e) => setInactivityPeriod(e.target.value)}
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
              
              {/* Customer Segment Preview */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Segment Preview</h4>
                  <span className="text-sm">{filteredCustomers.length} customers selected</span>
                </div>
                
                <div className="border dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Purchase</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spend</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredCustomers.slice(0, 5).map((customer,index) => (
                          <tr key={index}>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">{customer.name}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">{customer.email}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">{new Date(customer.lastPurchase).toLocaleDateString()}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">₹{customer.totalSpend.toLocaleString()}</td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {customer.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredCustomers.length > 5 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-2 text-sm text-center text-gray-500 dark:text-gray-400">
                              ... and {filteredCustomers.length - 5} more customers
                            </td>
                          </tr>
                        )}
                        {filteredCustomers.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                              No customers match the current filters
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
    {aiSuggestions.campaignSummary && (
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Campaign Summary</h4>
        <p className="text-sm">{aiSuggestions.campaignSummary}</p>
      </div>
    )}

    {/* Message Templates */}
    {aiSuggestions.messageTemplates &&
      aiSuggestions.messageTemplates.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Message Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiSuggestions.messageTemplates.map((item, index) =>
              item.templates.map((template, idx) => (
                <div
                  key={`${index}-${idx}`}
                  className="p-3 border dark:border-gray-700 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => selectMessageSuggestion(template)}
                >
                  <p className="text-sm">{template}</p>
                  <button className="mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                    Use This Template
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    {/* Top Performing Segments */}
    {aiSuggestions.topPerformingSegments &&
      aiSuggestions.topPerformingSegments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Top Performing Segments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiSuggestions.topPerformingSegments.map((segment, index) => (
              <div key={index} className="p-3 border dark:border-gray-700 rounded-md">
                <p className="text-sm font-semibold mb-1">{segment.tagline}</p>
                <p className="text-sm">CTA: {segment.callToAction}</p>
                <p className="text-sm">Idea: {segment.contentIdea}</p>
                <p className="text-sm">Message: {segment.personalizedMessage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    {/* Strategy Recommendations */}
    {aiSuggestions.strategyRecommendations &&
      aiSuggestions.strategyRecommendations.recommendations &&
      aiSuggestions.strategyRecommendations.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Strategy Recommendations</h4>
          <ul className="list-disc pl-5">
            {aiSuggestions.strategyRecommendations.recommendations.map(
              (rec, index) => (
                <li key={index} className="text-sm mb-2">
                  <p className="font-semibold">{rec.title}</p>
                  <p className="text-sm">{rec.explanation}</p>
                  <p className="text-sm italic">Outcome: {rec.expectedOutcome}</p>
                </li>
              )
            )}
          </ul>
        </div>
      )}

    {/* Additional Suggestions */}
    {aiSuggestions.additionalSuggestions && (
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
              <Users className="mr-2" size={16} /> Similar Audience
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
                            {campaign.tag || 'General'}
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
              <p>No campaigns have been created yet.</p>
            </div>
          )}
          
          {/* AI Performance Summary */}
          {campaigns.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
              <h3 className="text-sm font-medium mb-2 flex items-center text-blue-800 dark:text-blue-300">
                <Zap className="mr-1" size={16} /> AI Campaign Performance Summary
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your campaigns have reached a total of {campaigns.reduce((sum, campaign) => sum + campaign.delivered + campaign.failed, 0)} customers. Overall delivery success rate is {((campaigns.reduce((sum, campaign) => sum + campaign.delivered, 0) / campaigns.reduce((sum, campaign) => sum + campaign.delivered + campaign.failed, 0)) * 100).toFixed(1)}%. 
                High-spending customers had a higher engagement rate. Consider scheduling your next campaign on weekdays for optimal results.
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