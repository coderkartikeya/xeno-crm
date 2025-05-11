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

    // Generate campaign suggestions using AI
    const suggestions = await generateCampaignSuggestions(campaignName, targetAudience, segmentStats);
    
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Please use POST method to generate campaign suggestions.' },
    { status: 405 }
  );
}

// ---------------------- CAMPAIGN GENERATION FUNCTIONS -----------------------

async function generateCampaignSuggestions(campaignName, targetAudience, segmentStats) {
  try {
    const topPerformingSegments = segmentStats.sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 3);

    const suggestions = await Promise.all(
      topPerformingSegments.map(segment =>
        getAISuggestions(campaignName, targetAudience, segment)
      )
    );
    
    // Generate message templates with AI assistance
    const messageTemplates = await generateMessageTemplates(campaignName, targetAudience, topPerformingSegments);
    
    // Get overall campaign strategy recommendations
    const strategyRecommendations = await generateStrategyRecommendations(
      campaignName, 
      targetAudience, 
      topPerformingSegments
    );

    // Generate additional suggestions
    const additionalSuggestions = await generateAdditionalSuggestions(
      campaignName, 
      targetAudience, 
      topPerformingSegments
    );
  
    return {
      campaignSummary: `Campaign focused on ${targetAudience || 'General audience'}`,
      topPerformingSegments: suggestions,
      messageTemplates,
      strategyRecommendations,
      additionalSuggestions
    };
  } catch (error) {
    console.error('Error generating campaign suggestions:', error);
    return { error: 'Failed to generate campaign suggestions.' };
  }
}

async function getAISuggestions(campaignName, targetAudience, segment) {
  try {
    const prompt = `
    Generate marketing content ideas for a campaign with the following information:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'General audience'}
    - Specific Demographic: ${segment.demographic}
    - Current Engagement Rate: ${segment.engagementRate}%
    
    Please provide:
    1. A personalized marketing message (2-3 sentences)
    2. A content idea that would appeal to this demographic (2-3 sentences)
    3. A catchy tagline (under 10 words)
    4. A clear call to action (under 8 words)
    
    Format the response as JSON with keys: personalizedMessage, contentIdea, tagline, callToAction.
    `;

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a marketing expert specializing in campaign optimization." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      personalizedMessage: result.personalizedMessage,
      contentIdea: result.contentIdea,
      tagline: result.tagline,
      callToAction: result.callToAction
    };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    
    // Fallback to basic suggestions if AI fails
    return {
      personalizedMessage: `Tailor your message to resonate with ${segment.demographic}. Highlight features that appeal to their interests.`,
      contentIdea: `Use visuals and language that appeal to ${segment.demographic}. Include testimonials or data that reinforce the value proposition.`,
      tagline: `${campaignName}: Perfect for ${segment.demographic}`,
      callToAction: "Sign up today!"
    };
  }
}

async function generateMessageTemplates(campaignName, targetAudience, segments) {
  try {
    const segmentPrompts = segments.map(segment => segment.demographic).join(", ");
    
    const prompt = `
    Generate message templates for a marketing campaign with the following details:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'General audience'}
    - Key Demographics: ${segmentPrompts}
    
    Create 6-8 unique message templates total that would appeal to these demographics.
    Each template should be concise (under 100 characters) and compelling.
    
    Format the response as a simple JSON array of strings, with each string being a template message.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a marketing copywriter specializing in concise, high-impact messaging." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content);
    const templates = result.templates || result;
    
    // Ensure we have a uniform format and return both segment-specific and overall templates
    const segmentTemplates = segments.map(segment => ({
      demographic: segment.demographic,
      templates: [
        `Discover why "${campaignName}" is perfect for ${segment.demographic}!`,
        `Attention ${segment.demographic}! ${campaignName} is tailored for you.`,
      ]
    }));
    
    return segmentTemplates;
  } catch (error) {
    console.error('Error generating message templates:', error);
    
    // Fallback to basic templates
    return segments.map(segment => ({
      demographic: segment.demographic,
      templates: [
        `Discover why "${campaignName}" is perfect for ${segment.demographic}!`,
        `Attention ${segment.demographic}! ${campaignName} is tailored for you.`,
        `${campaignName} brings the best offers to ${targetAudience || 'you'} – don't miss out!`,
      ]
    }));
  }
}

async function generateStrategyRecommendations(campaignName, targetAudience, segments) {
  try {
    const segmentInfo = segments.map(s => 
      `${s.demographic} (Engagement Rate: ${s.engagementRate}%)`
    ).join(", ");
    
    const prompt = `
    As a marketing strategist, provide 3-5 strategic recommendations for the "${campaignName}" campaign.
    
    Campaign details:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'General audience'}
    - Top Performing Segments: ${segmentInfo}
    
    Focus on actionable recommendations that leverage the engagement data.
    For each recommendation, provide:
    1. A clear strategy title (5-7 words)
    2. A brief explanation (1-2 sentences)
    3. An expected outcome (1 sentence)
    
    Format as JSON with an array of objects containing keys: title, explanation, expectedOutcome.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an experienced marketing strategist specializing in data-driven campaign optimization." },
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
          title: "Focus on highest-engaging segments",
          explanation: "Allocate more resources to the segments showing the highest engagement rates.",
          expectedOutcome: "Improved overall campaign ROI."
        },
        {
          title: "Personalize content per segment",
          explanation: "Create tailored content for each demographic segment based on their specific interests.",
          expectedOutcome: "Higher conversion rates across all segments."
        },
        {
          title: "A/B test messaging templates",
          explanation: "Test different message templates to identify the most effective approach for each segment.",
          expectedOutcome: "Optimized messaging strategy based on empirical data."
        }
      ]
    };
  }
}

async function generateAdditionalSuggestions(campaignName, targetAudience, segments) {
  try {
    const segmentInfo = segments.map(s => 
      `${s.demographic} (Engagement Rate: ${s.engagementRate}%)`
    ).join(", ");
    
    const prompt = `
    For a marketing campaign with these details:
    - Campaign Name: "${campaignName}"
    - Target Audience: ${targetAudience || 'General audience'}
    - Top Performing Segments: ${segmentInfo}
    
    Provide these specific suggestions:
    1. Best time to send this campaign (scheduleSuggestion - one concise sentence)
    2. A similar audience that might respond well to this campaign (audienceSuggestion - one concise sentence)
    3. A single appropriate campaign tag/category for this campaign (campaignTag - a single short term like "Promotional", "Educational", "Seasonal", etc.)
    
    Format the response as JSON with keys: scheduleSuggestion, audienceSuggestion, campaignTag
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a marketing analytics expert specializing in campaign optimization." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      scheduleSuggestion: result.scheduleSuggestion || "Tuesday or Thursday mornings between 9-11 AM for optimal engagement.",
      audienceSuggestion: result.audienceSuggestion || `Users similar to ${segments[0]?.demographic || targetAudience} with interest in ${campaignName.split(' ')[0]}.`,
      campaignTag: result.campaignTag || "Promotional"
    };
  } catch (error) {
    console.error('Error generating additional suggestions:', error);
    
    // Fallback suggestions
    return {
      scheduleSuggestion: "Tuesday or Thursday mornings between 9-11 AM for optimal engagement.",
      audienceSuggestion: `Users similar to ${segments[0]?.demographic || targetAudience} with interest in ${campaignName.split(' ')[0]}.`,
      campaignTag: "Promotional"
    };
  }
}
