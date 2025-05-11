import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { campaignName, targetAudience, segmentStats } = body;

    // Validate required inputs
    if (!campaignName) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }
    
    if (!Array.isArray(segmentStats)) {
      return NextResponse.json({ error: 'segmentStats must be an array' }, { status: 400 });
    }

    // Generate order campaign suggestions using AI
    const suggestions = await generateOrderCampaignSuggestions(campaignName, targetAudience, segmentStats);
    
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Please use POST method to generate order campaign suggestions.' },
    { status: 405 }
  );
}

// ---------------------- ORDER CAMPAIGN GENERATION FUNCTIONS -----------------------

async function generateOrderCampaignSuggestions(campaignName, targetAudience, segmentStats) {
  try {
    const topPerformingSegments = segmentStats.sort((a, b) => b.avgOrderValue - a.avgOrderValue).slice(0, 3);

    const suggestions = await Promise.all(
      topPerformingSegments.map(segment =>
        getOrderAISuggestions(campaignName, targetAudience, segment)
      )
    );
    
    // Generate message templates with AI assistance
    const messageTemplates = await generateOrderMessageTemplates(campaignName, targetAudience, topPerformingSegments);
    
    // Get overall campaign strategy recommendations
    const strategyRecommendations = await generateOrderStrategyRecommendations(
      campaignName, 
      targetAudience, 
      topPerformingSegments
    );

    // Generate additional suggestions
    const additionalSuggestions = await generateOrderAdditionalSuggestions(
      campaignName, 
      targetAudience, 
      topPerformingSegments
    );
  
    return {
      campaignSummary: `Order campaign focused on ${targetAudience || 'All Orders'}`,
      topPerformingSegments: suggestions,
      messageTemplates,
      strategyRecommendations,
      additionalSuggestions
    };
  } catch (error) {
    console.error('Error generating order campaign suggestions:', error);
    return { error: 'Failed to generate order campaign suggestions.' };
  }
}

async function getOrderAISuggestions(campaignName, targetAudience, segment) {
  try {
    const prompt = `
    Generate order campaign content ideas with the following information:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'All Orders'}
    - Order Segment: ${segment.demographic}
    - Average Order Value: $${segment.avgOrderValue}
    - Total Orders: ${segment.totalOrders}
    - Status Distribution: ${JSON.stringify(segment.statusDistribution)}
    
    Please provide:
    1. A personalized order message (2-3 sentences)
    2. A follow-up strategy for this order segment (2-3 sentences)
    3. A catchy tagline (under 10 words)
    4. A clear call to action (under 8 words)
    
    Format the response as JSON with keys: personalizedMessage, followUpStrategy, tagline, callToAction.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an order management expert specializing in order follow-up and customer engagement." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      personalizedMessage: result.personalizedMessage,
      followUpStrategy: result.followUpStrategy,
      tagline: result.tagline,
      callToAction: result.callToAction
    };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    
    // Fallback to basic suggestions
    return {
      personalizedMessage: `Thank you for your order! We're processing it with care and will keep you updated on its status.`,
      followUpStrategy: `Send regular updates about order status and estimated delivery times.`,
      tagline: `${campaignName}: Your Order, Our Priority`,
      callToAction: "Track your order now!"
    };
  }
}

async function generateOrderMessageTemplates(campaignName, targetAudience, segments) {
  try {
    const segmentPrompts = segments.map(segment => 
      `${segment.demographic} (Avg Order Value: $${segment.avgOrderValue})`
    ).join(", ");
    
    const prompt = `
    Generate order message templates for a campaign with these details:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'All Orders'}
    - Key Segments: ${segmentPrompts}
    
    Create 6-8 unique message templates for order updates and follow-ups.
    Each template should be concise (under 100 characters) and include order-specific details.
    
    Format the response as a simple JSON array of strings, with each string being a template message.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an order management specialist focusing on clear, professional communication." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content);
    // Always return a flat array
    return Array.isArray(result) ? result : (result.templates || []);
  } catch (error) {
    console.error('Error generating message templates:', error);
    // Fallback to a flat array
    return [
      `Your order is being processed! We'll notify you when it ships.`,
      `Thank you for your order! Estimated delivery: 3-5 business days.`,
      `Order Update: Your items are being prepared for shipping.`,
    ];
  }
}

async function generateOrderStrategyRecommendations(campaignName, targetAudience, segments) {
  try {
    const segmentInfo = segments.map(s => 
      `${s.demographic} (Avg Order Value: $${s.avgOrderValue}, Total Orders: ${s.totalOrders})`
    ).join(", ");
    
    const prompt = `
    As an order management strategist, provide 3-5 strategic recommendations for the "${campaignName}" order campaign.
    
    Campaign details:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'All Orders'}
    - Top Performing Segments: ${segmentInfo}
    
    Focus on actionable recommendations for order follow-up and customer engagement.
    For each recommendation, provide:
    1. A clear strategy title (5-7 words)
    2. A brief explanation (1-2 sentences)
    3. An expected outcome (1 sentence)
    
    Format as JSON with an array of objects containing keys: title, explanation, expectedOutcome.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an experienced order management strategist specializing in customer engagement and order follow-up." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating strategy recommendations:', error);
    
    // Fallback to basic recommendations
    return {
      recommendations: [
        {
          title: "Prioritize high-value order updates",
          explanation: "Send more frequent updates for orders with higher value to maintain customer engagement.",
          expectedOutcome: "Improved customer satisfaction and reduced support inquiries."
        },
        {
          title: "Personalize order status messages",
          explanation: "Customize order update messages based on order value and customer segment.",
          expectedOutcome: "Higher engagement rates and better customer experience."
        },
        {
          title: "Implement proactive order tracking",
          explanation: "Send automated tracking updates at key order milestones.",
          expectedOutcome: "Reduced customer anxiety and fewer status inquiries."
        }
      ]
    };
  }
}

async function generateOrderAdditionalSuggestions(campaignName, targetAudience, segments) {
  try {
    const segmentInfo = segments.map(s => 
      `${s.demographic} (Avg Order Value: $${s.avgOrderValue}, Total Orders: ${s.totalOrders})`
    ).join(", ");
    
    const prompt = `
    For an order campaign with these details:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'All Orders'}
    - Top Performing Segments: ${segmentInfo}
    
    Provide these specific suggestions:
    1. Best time to send order updates (scheduleSuggestion - one concise sentence)
    2. A similar order segment that might benefit from this campaign (audienceSuggestion - one concise sentence)
    3. A single appropriate campaign tag/category for this order campaign (campaignTag - a single short term like "Order Update", "Shipping Status", "Delivery Tracking", etc.)
    
    Format the response as JSON with keys: scheduleSuggestion, audienceSuggestion, campaignTag
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an order management analytics expert specializing in order communication optimization." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      scheduleSuggestion: result.scheduleSuggestion || "Send order updates during business hours (9 AM - 5 PM) for immediate support availability.",
      audienceSuggestion: result.audienceSuggestion || `Orders similar to ${segments[0]?.demographic || targetAudience} with similar order values.`,
      campaignTag: result.campaignTag || "Order Update"
    };
  } catch (error) {
    console.error('Error generating additional suggestions:', error);
    
    // Fallback suggestions
    return {
      scheduleSuggestion: "Send order updates during business hours (9 AM - 5 PM) for immediate support availability.",
      audienceSuggestion: `Orders similar to ${segments[0]?.demographic || targetAudience} with similar order values.`,
      campaignTag: "Order Update"
    };
  }
} 