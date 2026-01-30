import { env } from "~/env";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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

// ==================== ENHANCED AI FEATURES ====================

// AI Crop Disease Detection (from symptoms description)
export async function detectCropDisease(params: {
  cropName: string;
  symptoms: string;
  affectedPart?: string;
  weatherConditions?: string;
}): Promise<{
  possibleDiseases: Array<{
    name: string;
    probability: number;
    description: string;
  }>;
  treatmentSuggestions: string[];
  preventiveMeasures: string[];
  urgency: "high" | "medium" | "low";
  consultExpert: boolean;
}> {
  const prompt = `You are an expert agricultural plant pathologist for Indian crops. Analyze these symptoms and identify possible diseases.

Crop: ${params.cropName}
Symptoms: ${params.symptoms}
Affected Part: ${params.affectedPart ?? "Not specified"}
Weather Conditions: ${params.weatherConditions ?? "Not specified"}

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "possibleDiseases": [
    {"name": "<disease name>", "probability": <0-1>, "description": "<brief description>"},
    {"name": "<disease name>", "probability": <0-1>, "description": "<brief description>"}
  ],
  "treatmentSuggestions": ["<treatment 1>", "<treatment 2>", "<treatment 3>"],
  "preventiveMeasures": ["<measure 1>", "<measure 2>"],
  "urgency": "<high|medium|low>",
  "consultExpert": <true|false>
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Disease Detection Error:", error);
    return {
      possibleDiseases: [],
      treatmentSuggestions: ["Please consult a local agricultural expert"],
      preventiveMeasures: ["Maintain proper spacing between plants", "Ensure good drainage"],
      urgency: "medium",
      consultExpert: true,
    };
  }
}

// AI Weather-Based Farming Recommendations
export async function getWeatherBasedRecommendations(params: {
  state: string;
  district?: string;
  currentCrops?: string[];
  season: string;
  weatherForecast?: string;
}): Promise<{
  alerts: Array<{ type: string; message: string; severity: "info" | "warning" | "critical" }>;
  recommendations: string[];
  irrigationAdvice: string;
  harvestingAdvice: string;
  pestRisk: "high" | "medium" | "low";
}> {
  const prompt = `You are an agricultural weather advisor for Indian farmers. Provide weather-based farming advice.

Location: ${params.district ? `${params.district}, ` : ""}${params.state}, India
Season: ${params.season}
Current Crops: ${params.currentCrops?.join(", ") ?? "Not specified"}
Weather Forecast: ${params.weatherForecast ?? "Seasonal average conditions expected"}

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "alerts": [
    {"type": "<alert type>", "message": "<alert message>", "severity": "<info|warning|critical>"}
  ],
  "recommendations": ["<rec 1>", "<rec 2>", "<rec 3>"],
  "irrigationAdvice": "<specific irrigation guidance>",
  "harvestingAdvice": "<harvesting timing advice>",
  "pestRisk": "<high|medium|low>"
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Weather Recommendations Error:", error);
    return {
      alerts: [],
      recommendations: ["Monitor weather forecasts regularly", "Maintain proper drainage"],
      irrigationAdvice: "Irrigate based on soil moisture levels",
      harvestingAdvice: "Harvest during dry weather conditions",
      pestRisk: "medium",
    };
  }
}

// AI Price Comparison Across Markets
export async function compareMarketPrices(params: {
  cropName: string;
  quantity: number;
  sellerState: string;
  prices: Array<{ mandiName: string; state: string; price: number }>;
}): Promise<{
  bestMarket: { name: string; state: string; price: number; reason: string };
  priceAnalysis: string;
  transportCostEstimate: string;
  netProfitComparison: Array<{ market: string; estimatedProfit: number }>;
  recommendation: string;
}> {
  const priceList = params.prices
    .map((p) => `${p.mandiName} (${p.state}): ₹${p.price}/quintal`)
    .join("\n");

  const prompt = `You are an agricultural market analyst. Compare these market prices for selling ${params.cropName}.

Seller Location: ${params.sellerState}
Quantity to Sell: ${params.quantity} quintals

Current Prices:
${priceList}

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "bestMarket": {
    "name": "<mandi name>",
    "state": "<state>",
    "price": <price number>,
    "reason": "<why this is the best option>"
  },
  "priceAnalysis": "<2-3 sentence analysis of price variations>",
  "transportCostEstimate": "<estimated transport cost consideration>",
  "netProfitComparison": [
    {"market": "<market 1>", "estimatedProfit": <profit in INR>},
    {"market": "<market 2>", "estimatedProfit": <profit in INR>}
  ],
  "recommendation": "<final recommendation for the farmer>"
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Price Comparison Error:", error);
    const best = params.prices.reduce((a, b) => (a.price > b.price ? a : b));
    return {
      bestMarket: { name: best.mandiName, state: best.state, price: best.price, reason: "Highest current price" },
      priceAnalysis: "Price comparison based on current market rates.",
      transportCostEstimate: "Consider local transport costs when making decisions.",
      netProfitComparison: params.prices.map((p) => ({ market: p.mandiName, estimatedProfit: p.price * params.quantity })),
      recommendation: `Consider selling at ${best.mandiName} for the best price.`,
    };
  }
}

// AI Soil Health Analysis
export async function analyzeSoilHealth(params: {
  soilType: string;
  phLevel?: number;
  nitrogenLevel?: string;
  phosphorusLevel?: string;
  potassiumLevel?: string;
  organicMatter?: string;
  currentCrop?: string;
}): Promise<{
  healthScore: number;
  analysis: string;
  deficiencies: string[];
  fertiliserRecommendations: Array<{ name: string; quantity: string; timing: string }>;
  improvementTips: string[];
  suitableCrops: string[];
}> {
  const prompt = `You are a soil scientist advising Indian farmers. Analyze this soil data and provide recommendations.

Soil Type: ${params.soilType}
pH Level: ${params.phLevel ?? "Not tested"}
Nitrogen (N): ${params.nitrogenLevel ?? "Not tested"}
Phosphorus (P): ${params.phosphorusLevel ?? "Not tested"}
Potassium (K): ${params.potassiumLevel ?? "Not tested"}
Organic Matter: ${params.organicMatter ?? "Not tested"}
Current/Planned Crop: ${params.currentCrop ?? "Not specified"}

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "healthScore": <1-100>,
  "analysis": "<overall soil health analysis>",
  "deficiencies": ["<deficiency 1>", "<deficiency 2>"],
  "fertiliserRecommendations": [
    {"name": "<fertiliser>", "quantity": "<amount per acre>", "timing": "<when to apply>"}
  ],
  "improvementTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "suitableCrops": ["<crop 1>", "<crop 2>", "<crop 3>"]
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Soil Analysis Error:", error);
    return {
      healthScore: 60,
      analysis: "Unable to complete detailed analysis. Please consult a soil testing lab.",
      deficiencies: [],
      fertiliserRecommendations: [],
      improvementTips: ["Get soil tested at a certified lab", "Add organic matter regularly"],
      suitableCrops: ["Consult local agricultural expert"],
    };
  }
}

// AI Government Scheme Matcher
export async function matchGovernmentSchemes(params: {
  state: string;
  farmerType: "small" | "marginal" | "medium" | "large";
  landSize: number;
  cropTypes: string[];
  hasKCC?: boolean;
  hasBankAccount?: boolean;
}): Promise<{
  eligibleSchemes: Array<{
    name: string;
    description: string;
    benefit: string;
    eligibility: string;
    howToApply: string;
  }>;
  totalPotentialBenefit: string;
  recommendations: string[];
}> {
  const prompt = `You are an expert on Indian agricultural government schemes and subsidies. Match the farmer with eligible schemes.

Farmer Details:
- State: ${params.state}
- Farmer Category: ${params.farmerType}
- Land Size: ${params.landSize} acres
- Crop Types: ${params.cropTypes.join(", ")}
- Has Kisan Credit Card: ${params.hasKCC ? "Yes" : "No/Unknown"}
- Has Bank Account: ${params.hasBankAccount ? "Yes" : "No/Unknown"}

List major central and state government schemes the farmer may be eligible for.

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "eligibleSchemes": [
    {
      "name": "<scheme name>",
      "description": "<brief description>",
      "benefit": "<monetary/other benefit>",
      "eligibility": "<key eligibility criteria>",
      "howToApply": "<application process>"
    }
  ],
  "totalPotentialBenefit": "<estimated total annual benefit>",
  "recommendations": ["<action item 1>", "<action item 2>"]
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Scheme Matching Error:", error);
    return {
      eligibleSchemes: [
        {
          name: "PM-KISAN",
          description: "Income support to farmer families",
          benefit: "₹6,000 per year in 3 installments",
          eligibility: "All landholding farmer families",
          howToApply: "Apply through CSC or pmkisan.gov.in",
        },
      ],
      totalPotentialBenefit: "Varies based on eligibility",
      recommendations: ["Visit your local agriculture office for complete scheme details"],
    };
  }
}

// AI Harvest Quality Predictor
export async function predictHarvestQuality(params: {
  cropName: string;
  sowingDate: string;
  currentGrowthStage: string;
  irrigationFrequency: string;
  fertiliserUsed?: string[];
  pestIssues?: string;
  weatherConditions?: string;
}): Promise<{
  predictedQuality: "premium" | "standard" | "below-standard";
  qualityScore: number;
  expectedYield: string;
  improvementSuggestions: string[];
  optimalHarvestWindow: string;
  storageRecommendations: string;
}> {
  const prompt = `You are an agricultural expert predicting harvest quality for Indian farmers.

Crop Details:
- Crop: ${params.cropName}
- Sowing Date: ${params.sowingDate}
- Current Growth Stage: ${params.currentGrowthStage}
- Irrigation: ${params.irrigationFrequency}
- Fertilisers Used: ${params.fertiliserUsed?.join(", ") ?? "Not specified"}
- Pest Issues: ${params.pestIssues ?? "None reported"}
- Weather: ${params.weatherConditions ?? "Normal"}

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "predictedQuality": "<premium|standard|below-standard>",
  "qualityScore": <1-100>,
  "expectedYield": "<expected yield per acre>",
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>"],
  "optimalHarvestWindow": "<best time to harvest>",
  "storageRecommendations": "<storage advice>"
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Quality Prediction Error:", error);
    return {
      predictedQuality: "standard",
      qualityScore: 70,
      expectedYield: "Average for the region",
      improvementSuggestions: ["Monitor crop regularly", "Ensure proper irrigation"],
      optimalHarvestWindow: "Harvest at crop maturity",
      storageRecommendations: "Store in cool, dry conditions",
    };
  }
}

// AI Smart Negotiation Assistant
export async function getNegotiationAdvice(params: {
  cropName: string;
  quantity: number;
  yourAskingPrice: number;
  buyerOffer: number;
  marketPrice: number;
  cropQuality: string;
  urgencyToSell: "high" | "medium" | "low";
}): Promise<{
  recommendedCounterOffer: number;
  negotiationTips: string[];
  strongPoints: string[];
  marketContext: string;
  walkAwayPrice: number;
  closingStrategy: string;
}> {
  const prompt = `You are a negotiation expert helping Indian farmers get the best price for their crops.

Deal Details:
- Crop: ${params.cropName}
- Quantity: ${params.quantity} quintals
- Your Asking Price: ₹${params.yourAskingPrice}/quintal
- Buyer's Offer: ₹${params.buyerOffer}/quintal
- Current Market Price: ₹${params.marketPrice}/quintal
- Quality Grade: ${params.cropQuality}
- Urgency to Sell: ${params.urgencyToSell}

Provide a JSON response (respond ONLY with valid JSON, no markdown):
{
  "recommendedCounterOffer": <price in INR>,
  "negotiationTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "strongPoints": ["<leverage point 1>", "<leverage point 2>"],
  "marketContext": "<current market situation to mention>",
  "walkAwayPrice": <minimum acceptable price>,
  "closingStrategy": "<how to close the deal>"
}`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Negotiation Error:", error);
    const midPoint = (params.yourAskingPrice + params.buyerOffer) / 2;
    return {
      recommendedCounterOffer: Math.round(midPoint),
      negotiationTips: ["Stay firm on quality premium", "Mention other interested buyers"],
      strongPoints: ["Quality of produce", "Market demand"],
      marketContext: `Current market rate is ₹${params.marketPrice}/quintal`,
      walkAwayPrice: Math.round(params.marketPrice * 0.95),
      closingStrategy: "Offer a slight discount for immediate full payment",
    };
  }
}

