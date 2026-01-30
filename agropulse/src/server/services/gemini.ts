import { env } from "~/env";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API Error:", error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as GeminiResponse;
  return data.candidates[0]?.content.parts[0]?.text ?? "";
}

// AI Price Prediction
export async function predictCropPrice(params: {
  cropName: string;
  state: string;
  district?: string;
  quantity: number;
  qualityGrade?: string;
  currentMarketPrice?: number;
}): Promise<{
  predictedPrice: number;
  confidence: number;
  recommendation: string;
  factors: string[];
  sellTimeSuggestion: string;
}> {
  const prompt = `You are an agricultural market expert AI assistant for Indian farmers. Analyze the following crop details and provide price predictions.

Crop Details:
- Crop Name: ${params.cropName}
- State: ${params.state}
- District: ${params.district ?? "Not specified"}
- Quantity: ${params.quantity} quintals
- Quality Grade: ${params.qualityGrade ?? "Standard"}
- Current Market Price: ₹${params.currentMarketPrice ?? "Unknown"}/quintal

Provide a JSON response with the following structure (respond ONLY with valid JSON, no markdown):
{
  "predictedPrice": <number in INR per quintal>,
  "confidence": <number between 0 and 1>,
  "recommendation": "<brief recommendation for the farmer>",
  "factors": ["<factor1>", "<factor2>", "<factor3>"],
  "sellTimeSuggestion": "<when to sell based on market trends>"
}

Consider these factors:
1. Seasonal demand patterns in India
2. Regional supply-demand dynamics
3. Weather conditions and crop yields
4. Government MSP (Minimum Support Price) if applicable
5. Export demand
6. Storage and transportation costs`;

  try {
    const response = await generateWithGemini(prompt);
    // Clean the response - remove markdown code blocks if present
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanedResponse) as {
      predictedPrice: number;
      confidence: number;
      recommendation: string;
      factors: string[];
      sellTimeSuggestion: string;
    };
    return parsed;
  } catch (error) {
    console.error("AI Price Prediction Error:", error);
    // Return fallback values
    return {
      predictedPrice: params.currentMarketPrice ?? 2000,
      confidence: 0.5,
      recommendation: "Unable to generate AI prediction. Please check market prices manually.",
      factors: ["Market data unavailable"],
      sellTimeSuggestion: "Check local mandi prices for best timing",
    };
  }
}

// AI Crop Recommendation
export async function getAICropRecommendation(params: {
  state: string;
  district?: string;
  season: string;
  soilType?: string;
  waterAvailability?: string;
  farmSize?: number;
}): Promise<{
  recommendedCrops: { name: string; reason: string; expectedReturn: string }[];
  tips: string[];
}> {
  const prompt = `You are an agricultural advisor AI for Indian farmers. Based on the following farm details, recommend suitable crops.

Farm Details:
- State: ${params.state}
- District: ${params.district ?? "Not specified"}
- Season: ${params.season}
- Soil Type: ${params.soilType ?? "Not specified"}
- Water Availability: ${params.waterAvailability ?? "Moderate"}
- Farm Size: ${params.farmSize ?? "Not specified"} acres

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "recommendedCrops": [
    {"name": "<crop1>", "reason": "<why this crop>", "expectedReturn": "<expected income per acre>"},
    {"name": "<crop2>", "reason": "<why this crop>", "expectedReturn": "<expected income per acre>"},
    {"name": "<crop3>", "reason": "<why this crop>", "expectedReturn": "<expected income per acre>"}
  ],
  "tips": ["<tip1>", "<tip2>", "<tip3>"]
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse) as {
      recommendedCrops: { name: string; reason: string; expectedReturn: string }[];
      tips: string[];
    };
  } catch (error) {
    console.error("AI Crop Recommendation Error:", error);
    return {
      recommendedCrops: [
        { name: "Wheat", reason: "Suitable for most regions", expectedReturn: "₹40,000-50,000/acre" },
        { name: "Rice", reason: "Good water availability", expectedReturn: "₹35,000-45,000/acre" },
        { name: "Pulses", reason: "Nitrogen fixing, good rotation crop", expectedReturn: "₹30,000-40,000/acre" },
      ],
      tips: ["Consult local agricultural officer for soil testing", "Check weather forecasts before sowing"],
    };
  }
}

// AI Chat Assistant
export async function chatWithAI(
  message: string,
  context: {
    userRole: string;
    userName?: string;
    crops?: string[];
    location?: string;
  }
): Promise<string> {
  const prompt = `You are AgroPulse AI, a helpful agricultural assistant for Indian farmers and buyers. You speak in a friendly, supportive manner and provide practical advice.

User Context:
- Role: ${context.userRole}
- Name: ${context.userName ?? "User"}
- Location: ${context.location ?? "India"}
- Crops of interest: ${context.crops?.join(", ") ?? "General farming"}

User Message: "${message}"

Respond helpfully in 2-3 paragraphs. If the user writes in Hindi (Hinglish), respond in the same style. Focus on:
1. Practical farming/trading advice
2. Market insights for India
3. Sustainable farming practices
4. Government schemes and subsidies if relevant

Keep the response concise and actionable.`;

  try {
    return await generateWithGemini(prompt);
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact our support team for assistance.";
  }
}

// AI Market Analysis
export async function analyzeMarketTrends(params: {
  cropName: string;
  state: string;
  historicalPrices?: { date: string; price: number }[];
}): Promise<{
  trend: "rising" | "falling" | "stable";
  analysis: string;
  forecast: string;
  buyerDemand: "high" | "medium" | "low";
}> {
  const priceHistory = params.historicalPrices
    ? params.historicalPrices.map((p) => `${p.date}: ₹${p.price}`).join(", ")
    : "No historical data available";

  const prompt = `Analyze the market trends for ${params.cropName} in ${params.state}, India.

Historical Prices: ${priceHistory}

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "trend": "<rising|falling|stable>",
  "analysis": "<brief market analysis in 2-3 sentences>",
  "forecast": "<price forecast for next 2-4 weeks>",
  "buyerDemand": "<high|medium|low>"
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse) as {
      trend: "rising" | "falling" | "stable";
      analysis: string;
      forecast: string;
      buyerDemand: "high" | "medium" | "low";
    };
  } catch (error) {
    console.error("AI Market Analysis Error:", error);
    return {
      trend: "stable",
      analysis: "Unable to analyze market trends at this time.",
      forecast: "Check local mandi prices for current rates.",
      buyerDemand: "medium",
    };
  }
}
