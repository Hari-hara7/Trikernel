import { env } from "~/env";
import { db } from "~/server/db";

// Data.gov.in API response structure
interface AgMarketRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface AgMarketResponse {
  records: AgMarketRecord[];
  total: number;
  count: number;
}

/**
 * Fetch live mandi prices from Data.gov.in API
 */
export async function fetchLiveMandiPrices(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
  offset?: number;
}): Promise<AgMarketRecord[]> {
  const apiUrl = env.AGMARKET_API_URL;
  const apiKey = env.AGMARKET_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn("AGMARKET API credentials not configured, using cached data");
    return [];
  }

  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      "api-key": apiKey,
      format: "json",
      limit: String(params?.limit ?? 100),
      offset: String(params?.offset ?? 0),
    });

    // Add filters if provided
    if (params?.state) {
      queryParams.append("filters[state]", params.state);
    }
    if (params?.district) {
      queryParams.append("filters[district]", params.district);
    }
    if (params?.commodity) {
      queryParams.append("filters[commodity]", params.commodity);
    }

    const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AgMarket API Error:", response.status, errorText);
      throw new Error(`AgMarket API error: ${response.status}`);
    }

    const data = (await response.json()) as AgMarketResponse;
    return data.records ?? [];
  } catch (error) {
    console.error("Failed to fetch mandi prices:", error);
    return [];
  }
}

/**
 * Sync mandi prices from API to database
 */
export async function syncMandiPricesToDatabase(params?: {
  state?: string;
  commodity?: string;
}): Promise<{ synced: number; errors: number }> {
  let synced = 0;
  let errors = 0;
  let offset = 0;
  const limit = 100;

  try {
    // Fetch prices in batches
    while (true) {
      const records = await fetchLiveMandiPrices({
        state: params?.state,
        commodity: params?.commodity,
        limit,
        offset,
      });

      if (records.length === 0) break;

      // Process each record
      for (const record of records) {
        try {
          // Parse the arrival date
          const priceDate = parseIndianDate(record.arrival_date);

          // Upsert the price record
          await db.mandiPrice.upsert({
            where: {
              // Create a composite unique identifier
              cropName_variety_mandiName_priceDate: {
                cropName: record.commodity,
                variety: record.variety || "Regular",
                mandiName: record.market,
                priceDate: priceDate,
              },
            },
            update: {
              minPrice: parseFloat(record.min_price) || 0,
              maxPrice: parseFloat(record.max_price) || 0,
              modalPrice: parseFloat(record.modal_price) || 0,
              updatedAt: new Date(),
            },
            create: {
              cropName: record.commodity,
              variety: record.variety || "Regular",
              mandiName: record.market,
              state: record.state,
              district: record.district,
              minPrice: parseFloat(record.min_price) || 0,
              maxPrice: parseFloat(record.max_price) || 0,
              modalPrice: parseFloat(record.modal_price) || 0,
              priceDate: priceDate,
            },
          });
          synced++;
        } catch (err) {
          console.error("Error syncing record:", err);
          errors++;
        }
      }

      // Move to next batch
      offset += limit;

      // Safety limit - don't fetch more than 1000 records at once
      if (offset >= 1000) break;
    }

    console.log(`Mandi price sync complete: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error("Failed to sync mandi prices:", error);
    return { synced, errors: errors + 1 };
  }
}

/**
 * Get mandi prices with fallback to cached data
 */
export async function getMandiPricesWithFallback(params?: {
  cropName?: string;
  state?: string;
  district?: string;
  limit?: number;
}): Promise<{
  prices: Array<{
    id: string;
    cropName: string;
    variety: string;
    mandiName: string;
    state: string;
    district: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    priceDate: Date;
    source: "live" | "cached";
  }>;
  lastUpdated: Date | null;
}> {
  // First try to get from database (cached data)
  const cachedPrices = await db.mandiPrice.findMany({
    where: {
      ...(params?.cropName && {
        cropName: { contains: params.cropName, mode: "insensitive" as const },
      }),
      ...(params?.state && { state: params.state }),
      ...(params?.district && { district: params.district }),
    },
    orderBy: { priceDate: "desc" },
    take: params?.limit ?? 50,
  });

  // Check if cache is stale (older than 6 hours)
  const latestPrice = cachedPrices[0];
  const isStale = !latestPrice || 
    (new Date().getTime() - new Date(latestPrice.updatedAt).getTime()) > 6 * 60 * 60 * 1000;

  if (isStale) {
    // Try to fetch fresh data
    try {
      const liveRecords = await fetchLiveMandiPrices({
        state: params?.state,
        commodity: params?.cropName,
        limit: params?.limit ?? 50,
      });

      if (liveRecords.length > 0) {
        // Return live data
        return {
          prices: liveRecords.map((record, index) => ({
            id: `live-${index}`,
            cropName: record.commodity,
            variety: record.variety || "Regular",
            mandiName: record.market,
            state: record.state,
            district: record.district,
            minPrice: parseFloat(record.min_price) || 0,
            maxPrice: parseFloat(record.max_price) || 0,
            modalPrice: parseFloat(record.modal_price) || 0,
            priceDate: parseIndianDate(record.arrival_date),
            source: "live" as const,
          })),
          lastUpdated: new Date(),
        };
      }
    } catch (error) {
      console.error("Failed to fetch live prices, using cached:", error);
    }
  }

  // Return cached data
  return {
    prices: cachedPrices.map((price) => ({
      ...price,
      source: "cached" as const,
    })),
    lastUpdated: latestPrice?.updatedAt ?? null,
  };
}

/**
 * Parse Indian date format (DD/MM/YYYY or DD-MM-YYYY)
 */
function parseIndianDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Try DD/MM/YYYY format
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2]!, 10);
    return new Date(year, month, day);
  }

  // Fallback to default parsing
  return new Date(dateStr);
}

/**
 * Get available states from the database
 */
export async function getAvailableStates(): Promise<string[]> {
  const states = await db.mandiPrice.findMany({
    select: { state: true },
    distinct: ["state"],
    orderBy: { state: "asc" },
  });
  return states.map((s) => s.state);
}

/**
 * Get available commodities/crops from the database
 */
export async function getAvailableCommodities(): Promise<string[]> {
  const commodities = await db.mandiPrice.findMany({
    select: { cropName: true },
    distinct: ["cropName"],
    orderBy: { cropName: "asc" },
  });
  return commodities.map((c) => c.cropName);
}

/**
 * Get price trends for a specific crop
 */
export async function getCropPriceTrend(params: {
  cropName: string;
  state?: string;
  days?: number;
}): Promise<{
  trend: "up" | "down" | "stable";
  percentChange: number;
  priceHistory: Array<{ date: Date; avgPrice: number }>;
}> {
  const days = params.days ?? 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const prices = await db.mandiPrice.findMany({
    where: {
      cropName: { contains: params.cropName, mode: "insensitive" as const },
      ...(params.state && { state: params.state }),
      priceDate: { gte: startDate },
    },
    orderBy: { priceDate: "asc" },
  });

  if (prices.length < 2) {
    return {
      trend: "stable",
      percentChange: 0,
      priceHistory: prices.map((p) => ({
        date: p.priceDate,
        avgPrice: p.modalPrice,
      })),
    };
  }

  // Calculate average prices by date
  const pricesByDate = new Map<string, number[]>();
  for (const price of prices) {
    const dateKey = price.priceDate.toISOString().split("T")[0]!;
    if (!pricesByDate.has(dateKey)) {
      pricesByDate.set(dateKey, []);
    }
    pricesByDate.get(dateKey)!.push(price.modalPrice);
  }

  const priceHistory = Array.from(pricesByDate.entries()).map(([date, priceList]) => ({
    date: new Date(date),
    avgPrice: priceList.reduce((a, b) => a + b, 0) / priceList.length,
  }));

  // Calculate trend
  const firstAvg = priceHistory[0]?.avgPrice ?? 0;
  const lastAvg = priceHistory[priceHistory.length - 1]?.avgPrice ?? 0;
  const percentChange = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

  let trend: "up" | "down" | "stable" = "stable";
  if (percentChange > 2) trend = "up";
  else if (percentChange < -2) trend = "down";

  return {
    trend,
    percentChange: Math.round(percentChange * 100) / 100,
    priceHistory,
  };
}
