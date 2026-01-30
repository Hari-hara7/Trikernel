"use client";

import React, { useState, type ChangeEvent } from "react";
import {
  Brain,
  Leaf,
  Cloud,
  TrendingUp,
  FlaskConical,
  FileText,
  Sparkles,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

type FarmerType = "small" | "marginal" | "medium" | "large";
type UrgencyType = "high" | "medium" | "low";

const CROPS = ["Wheat", "Rice", "Cotton", "Soybean", "Maize", "Tomato", "Onion", "Potato", "Sugarcane", "Chillies"];
const STATES = ["Maharashtra", "Punjab", "Uttar Pradesh", "Gujarat", "Madhya Pradesh", "Karnataka", "Rajasthan", "Tamil Nadu", "West Bengal", "Andhra Pradesh"];
const SEASONS = ["Kharif", "Rabi", "Zaid", "Summer", "Winter"];

function getUrgencyColor(urgency: string) {
  if (urgency === "high") return "text-red-600";
  if (urgency === "medium") return "text-amber-600";
  return "text-green-600";
}

export default function AIAssistantPage() {
  // Disease Detection State
  const [symptoms, setSymptoms] = useState("");
  const [diseaseCrop, setDiseaseCrop] = useState("");

  // Weather Recommendations State
  const [weatherState, setWeatherState] = useState("");
  const [weatherSeason, setWeatherSeason] = useState("");

  // Price Comparison State
  const [priceCrop, setPriceCrop] = useState("");
  const [priceState, setPriceState] = useState("");
  const [priceQuantity, setPriceQuantity] = useState("100");

  // Soil Analysis State
  const [soilType, setSoilType] = useState("loamy");
  const [soilPh, setSoilPh] = useState("6.5");
  const [nitrogenLevel, setNitrogenLevel] = useState("medium");
  const [phosphorusLevel, setPhosphorusLevel] = useState("medium");
  const [potassiumLevel, setPotassiumLevel] = useState("medium");
  const [soilCrop, setSoilCrop] = useState("");

  // Scheme Matching State
  const [farmSize, setFarmSize] = useState("");
  const [schemeState, setSchemeState] = useState("");
  const [farmerType, setFarmerType] = useState<FarmerType>("small");
  const [schemeCrops, setSchemeCrops] = useState("");

  // Negotiation State
  const [askingPrice, setAskingPrice] = useState("");
  const [buyerOffer, setBuyerOffer] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [negotiationCrop, setNegotiationCrop] = useState("");
  const [negotiationQty, setNegotiationQty] = useState("100");
  const [cropQuality, setCropQuality] = useState("A");
  const [urgency, setUrgency] = useState<UrgencyType>("medium");

  // API Mutations
  const diseaseDetection = api.ai.detectDisease.useMutation();
  const weatherRecommendations = api.ai.getWeatherRecommendations.useMutation();
  const priceComparison = api.ai.smartPriceCompare.useMutation();
  const soilAnalysis = api.ai.analyzeSoil.useMutation();
  const schemeMatching = api.ai.matchSchemes.useMutation();
  const negotiationAdvice = api.ai.getNegotiationAdvice.useMutation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-secondary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Powered by Gemini AI for smart farming decisions
          </p>
        </div>
      </div>

      <Tabs defaultValue="disease" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-2">
          <TabsTrigger value="disease" className="gap-1.5 text-xs sm:text-sm py-2">
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">Disease</span>
          </TabsTrigger>
          <TabsTrigger value="weather" className="gap-1.5 text-xs sm:text-sm py-2">
            <Cloud className="h-4 w-4" />
            <span className="hidden sm:inline">Weather</span>
          </TabsTrigger>
          <TabsTrigger value="prices" className="gap-1.5 text-xs sm:text-sm py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Prices</span>
          </TabsTrigger>
          <TabsTrigger value="soil" className="gap-1.5 text-xs sm:text-sm py-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Soil</span>
          </TabsTrigger>
          <TabsTrigger value="schemes" className="gap-1.5 text-xs sm:text-sm py-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Schemes</span>
          </TabsTrigger>
          <TabsTrigger value="negotiate" className="gap-1.5 text-xs sm:text-sm py-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Negotiate</span>
          </TabsTrigger>
        </TabsList>

        {/* Disease Detection Tab */}
        <TabsContent value="disease" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Crop Disease Detection
              </CardTitle>
              <CardDescription>
                Describe your crop symptoms and get AI-powered diagnosis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Crop Type</Label>
                  <Select value={diseaseCrop} onValueChange={setDiseaseCrop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROPS.map((crop) => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Describe Symptoms (min 10 characters)</Label>
                <Textarea
                  placeholder="E.g., Yellow spots on leaves, wilting stems, brown patches..."
                  value={symptoms}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSymptoms(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => diseaseDetection.mutate({ cropName: diseaseCrop, symptoms })}
                disabled={!diseaseCrop || symptoms.length < 10 || diseaseDetection.isPending}
                className="w-full md:w-auto"
              >
                {diseaseDetection.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />Detect Disease</>
                )}
              </Button>
              {diseaseDetection.data && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />AI Diagnosis Result
                  </h4>
                  {diseaseDetection.data.possibleDiseases.map((disease: {name: string; probability: number; description: string}, i: number) => (
                    <div key={i} className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{disease.name}</span>
                        <span className="text-sm text-muted-foreground">{(disease.probability * 100).toFixed(0)}% likely</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{disease.description}</p>
                    </div>
                  ))}
                  {diseaseDetection.data.treatmentSuggestions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-700">Treatment Suggestions:</h5>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {diseaseDetection.data.treatmentSuggestions.map((t: string, i: number) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span>Urgency:</span>
                    <span className={"font-medium " + getUrgencyColor(diseaseDetection.data.urgency)}>
                      {diseaseDetection.data.urgency.toUpperCase()}
                    </span>
                    {diseaseDetection.data.consultExpert && <span className="text-red-600">(Consult an expert)</span>}
                  </div>
                </div>
              )}
              {diseaseDetection.error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />{diseaseDetection.error.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weather Recommendations Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-600" />Weather-Based Recommendations
              </CardTitle>
              <CardDescription>Get personalized farming advice based on your location and season</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={weatherState} onValueChange={setWeatherState}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Select value={weatherSeason} onValueChange={setWeatherSeason}>
                    <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                    <SelectContent>{SEASONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => weatherRecommendations.mutate({ state: weatherState, season: weatherSeason })}
                disabled={!weatherState || !weatherSeason || weatherRecommendations.isPending}
                className="w-full md:w-auto"
              >
                {weatherRecommendations.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Getting Advice...</> : <><Sparkles className="h-4 w-4 mr-2" />Get Recommendations</>}
              </Button>
              {weatherRecommendations.data && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-700"><Cloud className="h-5 w-5" />Weather Recommendations</h4>
                  <div><h5 className="font-medium">Recommendations:</h5><ul className="list-disc list-inside text-sm mt-1">{weatherRecommendations.data.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 bg-white rounded border"><h6 className="font-medium text-sm">Irrigation Advice</h6><p className="text-sm text-muted-foreground">{weatherRecommendations.data.irrigationAdvice}</p></div>
                    <div className="p-3 bg-white rounded border"><h6 className="font-medium text-sm">Harvesting Advice</h6><p className="text-sm text-muted-foreground">{weatherRecommendations.data.harvestingAdvice}</p></div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Pest Risk:</span>{" "}
                    <span className={getUrgencyColor(weatherRecommendations.data.pestRisk)}>{weatherRecommendations.data.pestRisk.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" />Smart Price Comparison</CardTitle>
              <CardDescription>AI-powered price analysis with live mandi data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Crop</Label><Select value={priceCrop} onValueChange={setPriceCrop}><SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger><SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Your State</Label><Select value={priceState} onValueChange={setPriceState}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Quantity (quintals)</Label><Input type="number" value={priceQuantity} onChange={(e: ChangeEvent<HTMLInputElement>) => setPriceQuantity(e.target.value)} /></div>
              </div>
              <Button onClick={() => priceComparison.mutate({ cropName: priceCrop, state: priceState, quantity: parseFloat(priceQuantity) || 100 })} disabled={!priceCrop || !priceState || priceComparison.isPending} className="w-full md:w-auto">
                {priceComparison.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" />Compare Prices</>}
              </Button>
              {priceComparison.data && "bestMarket" in priceComparison.data && priceComparison.data.bestMarket && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2"><Brain className="h-5 w-5" />Best Market: {priceComparison.data.bestMarket.name}</h4>
                  <p className="text-green-700 mt-1">Price: ₹{priceComparison.data.bestMarket.price}/quintal</p>
                  <p className="text-sm text-green-600 mt-2">{priceComparison.data.recommendation}</p>
                </div>
              )}
              {priceComparison.data && "message" in priceComparison.data && priceComparison.data.message && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200"><p className="text-amber-700">{priceComparison.data.message}</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Soil Tab */}
        <TabsContent value="soil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5 text-amber-600" />Soil Health Analysis</CardTitle>
              <CardDescription>Get AI recommendations based on your soil data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2"><Label>Soil Type</Label><Select value={soilType} onValueChange={setSoilType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sandy">Sandy</SelectItem><SelectItem value="loamy">Loamy</SelectItem><SelectItem value="clay">Clay</SelectItem><SelectItem value="black">Black Cotton</SelectItem><SelectItem value="red">Red Soil</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>pH Level</Label><Input type="number" step="0.1" value={soilPh} onChange={(e: ChangeEvent<HTMLInputElement>) => setSoilPh(e.target.value)} /></div>
                <div className="space-y-2"><Label>Nitrogen Level</Label><Select value={nitrogenLevel} onValueChange={setNitrogenLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Phosphorus Level</Label><Select value={phosphorusLevel} onValueChange={setPhosphorusLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Potassium Level</Label><Select value={potassiumLevel} onValueChange={setPotassiumLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Current Crop (optional)</Label><Select value={soilCrop} onValueChange={setSoilCrop}><SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger><SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <Button onClick={() => soilAnalysis.mutate({ soilType, phLevel: parseFloat(soilPh) || undefined, nitrogenLevel, phosphorusLevel, potassiumLevel, currentCrop: soilCrop || undefined })} disabled={!soilType || soilAnalysis.isPending} className="w-full md:w-auto">
                {soilAnalysis.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" />Analyze Soil</>}
              </Button>
              {soilAnalysis.data && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-amber-700"><FlaskConical className="h-5 w-5" />Soil Analysis Results</h4>
                  <div><span className="text-sm text-muted-foreground">Health Score</span><p className="text-2xl font-bold text-amber-600">{soilAnalysis.data.healthScore}/100</p></div>
                  <div><h5 className="font-medium">Analysis:</h5><p className="text-sm mt-1">{soilAnalysis.data.analysis}</p></div>
                  <div><h5 className="font-medium">Suitable Crops:</h5><div className="flex flex-wrap gap-2 mt-1">{soilAnalysis.data.suitableCrops.map((crop: string, i: number) => <span key={i} className="px-2 py-1 bg-amber-100 rounded text-sm">{crop}</span>)}</div></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schemes Tab */}
        <TabsContent value="schemes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-purple-600" />Government Scheme Matching</CardTitle>
              <CardDescription>Find government schemes and subsidies you may be eligible for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2"><Label>State</Label><Select value={schemeState} onValueChange={setSchemeState}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Farmer Type</Label><Select value={farmerType} onValueChange={(v: string) => setFarmerType(v as FarmerType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="marginal">Marginal (&lt;1 ha)</SelectItem><SelectItem value="small">Small (1-2 ha)</SelectItem><SelectItem value="medium">Medium (2-4 ha)</SelectItem><SelectItem value="large">Large (&gt;4 ha)</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Land Size (acres)</Label><Input type="number" placeholder="E.g., 5" value={farmSize} onChange={(e: ChangeEvent<HTMLInputElement>) => setFarmSize(e.target.value)} /></div>
                <div className="space-y-2"><Label>Crops Grown</Label><Input placeholder="E.g., Wheat, Rice" value={schemeCrops} onChange={(e: ChangeEvent<HTMLInputElement>) => setSchemeCrops(e.target.value)} /></div>
              </div>
              <Button onClick={() => schemeMatching.mutate({ state: schemeState, farmerType, landSize: parseFloat(farmSize) || 0, cropTypes: schemeCrops.split(",").map((c) => c.trim()).filter(Boolean) })} disabled={!schemeState || !farmSize || schemeMatching.isPending} className="w-full md:w-auto">
                {schemeMatching.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Finding Schemes...</> : <><Sparkles className="h-4 w-4 mr-2" />Find Schemes</>}
              </Button>
              {schemeMatching.data && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-purple-700"><FileText className="h-5 w-5" />Eligible Schemes ({schemeMatching.data.eligibleSchemes.length})</h4>
                  {schemeMatching.data.eligibleSchemes.map((scheme: {name: string; description: string; benefit: string; howToApply: string}, i: number) => (
                    <div key={i} className="p-3 bg-white rounded border">
                      <h5 className="font-medium">{scheme.name}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{scheme.description}</p>
                      <div className="mt-2 text-sm"><span className="font-medium">Benefit:</span> {scheme.benefit}</div>
                      <div className="text-sm"><span className="font-medium">How to Apply:</span> {scheme.howToApply}</div>
                    </div>
                  ))}
                  <div className="p-3 bg-purple-100 rounded"><span className="font-medium">Total Potential Benefit:</span> {schemeMatching.data.totalPotentialBenefit}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Negotiate Tab */}
        <TabsContent value="negotiate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-indigo-600" />Negotiation Advice</CardTitle>
              <CardDescription>Get AI tips to negotiate better prices for your crops</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2"><Label>Crop</Label><Select value={negotiationCrop} onValueChange={setNegotiationCrop}><SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger><SelectContent>{CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Quantity (quintals)</Label><Input type="number" value={negotiationQty} onChange={(e: ChangeEvent<HTMLInputElement>) => setNegotiationQty(e.target.value)} /></div>
                <div className="space-y-2"><Label>Crop Quality</Label><Select value={cropQuality} onValueChange={setCropQuality}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A">Grade A (Premium)</SelectItem><SelectItem value="B">Grade B (Good)</SelectItem><SelectItem value="C">Grade C (Average)</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Your Asking Price (₹/quintal)</Label><Input type="number" placeholder="E.g., 2500" value={askingPrice} onChange={(e: ChangeEvent<HTMLInputElement>) => setAskingPrice(e.target.value)} /></div>
                <div className="space-y-2"><Label>Buyer&apos;s Offer (₹/quintal)</Label><Input type="number" placeholder="E.g., 2200" value={buyerOffer} onChange={(e: ChangeEvent<HTMLInputElement>) => setBuyerOffer(e.target.value)} /></div>
                <div className="space-y-2"><Label>Current Market Price (₹/quintal)</Label><Input type="number" placeholder="E.g., 2400" value={marketPrice} onChange={(e: ChangeEvent<HTMLInputElement>) => setMarketPrice(e.target.value)} /></div>
                <div className="space-y-2"><Label>Urgency to Sell</Label><Select value={urgency} onValueChange={(v: string) => setUrgency(v as UrgencyType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low (Can wait)</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High (Need to sell soon)</SelectItem></SelectContent></Select></div>
              </div>
              <Button onClick={() => negotiationAdvice.mutate({ cropName: negotiationCrop, quantity: parseFloat(negotiationQty) || 100, yourAskingPrice: parseFloat(askingPrice), buyerOffer: parseFloat(buyerOffer), marketPrice: parseFloat(marketPrice), cropQuality, urgencyToSell: urgency })} disabled={!negotiationCrop || !askingPrice || !buyerOffer || !marketPrice || negotiationAdvice.isPending} className="w-full md:w-auto">
                {negotiationAdvice.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Getting Advice...</> : <><Sparkles className="h-4 w-4 mr-2" />Get Negotiation Tips</>}
              </Button>
              {negotiationAdvice.data && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-indigo-700"><MessageSquare className="h-5 w-5" />Negotiation Strategy</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 bg-white rounded border"><span className="text-sm text-muted-foreground">Recommended Counter-Offer</span><p className="text-xl font-bold text-indigo-600">₹{negotiationAdvice.data.recommendedCounterOffer}/quintal</p></div>
                    <div className="p-3 bg-white rounded border"><span className="text-sm text-muted-foreground">Walk-Away Price</span><p className="text-xl font-bold text-red-600">₹{negotiationAdvice.data.walkAwayPrice}/quintal</p></div>
                  </div>
                  <div><h5 className="font-medium">Negotiation Tips:</h5><ul className="list-disc list-inside text-sm mt-1">{negotiationAdvice.data.negotiationTips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}</ul></div>
                  <div><h5 className="font-medium">Your Strong Points:</h5><ul className="list-disc list-inside text-sm mt-1">{negotiationAdvice.data.strongPoints.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul></div>
                  <div className="p-3 bg-indigo-100 rounded"><h5 className="font-medium">Closing Strategy:</h5><p className="text-sm mt-1">{negotiationAdvice.data.closingStrategy}</p></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
