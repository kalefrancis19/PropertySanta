import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Fallback responses for when AI is unavailable
const fallbackResponses = {
  welcome: "Welcome to PropertySanta! Your AI-powered green cleaning and intelligent task management platform. We're here to help you maintain your properties with smart, eco-friendly cleaning solutions.",
  
  cleaningInsights: `Based on your property at 123 Main St (2,500 sq ft, 4 rooms), here are personalized recommendations:

1. **Weekly Cleaning Schedule**: Maintain consistent weekly cleanings for optimal results
2. **Pet-Friendly Focus**: Use eco-friendly products safe for pets and family
3. **Hardwood Floor Care**: Use specialized cleaners to preserve your hardwood floors
4. **Green Cleaning**: All products are eco-friendly and safe for your home
5. **Special Attention**: Focus on high-traffic areas like kitchen and living room

Your property is well-maintained with regular cleanings!`,
  
  reportAnalysis: `Cleaning Report Analysis for April 18, 2024:

**Overall Assessment**: Excellent cleaning quality with 4.5-star rating
**Areas of Excellence**: Kitchen surfaces spotless, bathroom fixtures polished
**Attention Needed**: Minor carpet stain in living room, ceiling fan dusting required
**Recommendations**: 
- Address carpet stain with specialized cleaner
- Include ceiling fan cleaning in next service
- Continue excellent work on kitchen and bathroom areas

**Summary**: High-quality cleaning with minor areas for improvement.`,
  
  smartNotifications: [
    "🌞 Perfect weather for deep cleaning on April 25! Sunny 75°F conditions ideal for thorough service.",
    "🧹 Reminder: Address carpet stain in living room during next cleaning session.",
    "🌪️ Ceiling fan dusting recommended - cleaner will focus on this area.",
    "💡 HVAC filter replacement due - consider scheduling maintenance.",
    "🌧️ Gutter cleaning recommended before rainy season."
  ]
};

// Helper function for AI-powered text generation with fallback
export async function generateAIText(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('AI Error:', error);
    
    // Check if it's a service overload error
    if (error.message?.includes('overloaded') || error.message?.includes('503')) {
      return fallbackResponses.welcome;
    }
    
    return 'AI service temporarily unavailable. Please try again later.';
  }
}

// Helper function for cleaning report analysis with fallback
export async function analyzeCleaningReport(reportData: any): Promise<string> {
  try {
    const prompt = `
      Analyze this cleaning report and provide a summary:
      ${JSON.stringify(reportData, null, 2)}
      
      Please provide:
      1. Overall cleaning quality assessment
      2. Areas that need attention
      3. Recommendations for improvement
      4. Summary for the homeowner
    `;
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Report Analysis Error:', error);
    
    if (error.message?.includes('overloaded') || error.message?.includes('503')) {
      return fallbackResponses.reportAnalysis;
    }
    
    return 'Report analysis temporarily unavailable. Please try again later.';
  }
}

// Helper function for generating cleaning recommendations with fallback
export async function generateCleaningRecommendations(propertyData: any): Promise<string> {
  try {
    const prompt = `
      Based on this property data, generate personalized cleaning recommendations:
      ${JSON.stringify(propertyData, null, 2)}
      
      Please provide:
      1. Specific cleaning tasks for this property
      2. Frequency recommendations
      3. Special considerations
      4. Green cleaning suggestions
    `;
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Recommendations Error:', error);
    
    if (error.message?.includes('overloaded') || error.message?.includes('503')) {
      return fallbackResponses.cleaningInsights;
    }
    
    return 'Cleaning recommendations temporarily unavailable. Please try again later.';
  }
}

// Helper function for smart notifications with fallback
export async function generateSmartNotifications(notificationData: any): Promise<string[]> {
  try {
    const prompt = `
      Based on this property management data, generate 3-4 smart, contextual notifications for a homeowner:
      
      Upcoming Cleaning: ${notificationData.upcomingCleaning.date} at ${notificationData.upcomingCleaning.time} at ${notificationData.upcomingCleaning.property}
      Recent Issues: ${notificationData.recentIssues.join(', ')}
      Weather: ${notificationData.weatherForecast}
      Maintenance: ${notificationData.maintenanceReminders.join(', ')}
      
      Generate notifications that are:
      1. Actionable and specific
      2. Relevant to the upcoming cleaning
      3. Consider weather conditions
      4. Address recent issues
      5. Include maintenance reminders
      
      Format as a simple list with clear, concise messages.
    `;
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text().split('\n').filter(line => line.trim().length > 0);
  } catch (error: any) {
    console.error('Smart Notifications Error:', error);
    
    if (error.message?.includes('overloaded') || error.message?.includes('503')) {
      return fallbackResponses.smartNotifications;
    }
    
    return ['Smart notifications temporarily unavailable. Please try again later.'];
  }
} 