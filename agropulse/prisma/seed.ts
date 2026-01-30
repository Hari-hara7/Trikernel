import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// The main user ID to seed data for
const MAIN_USER_ID = "cml0nygvn0000qlpoksxqdke2";

async function main() {
  console.log("🌱 Starting database seed...");

  // First, check if the main user exists
  const mainUser = await prisma.user.findUnique({
    where: { id: MAIN_USER_ID },
  });

  if (!mainUser) {
    console.log("❌ Main user not found. Creating...");
    await prisma.user.create({
      data: {
        id: MAIN_USER_ID,
        name: "Demo Farmer",
        email: "farmer@demo.com",
        role: "FARMER",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        trustScore: 85,
        avgRating: 4.5,
        totalRatings: 12,
      },
    });
    console.log("✅ Main user created");
  } else {
    console.log(`✅ Main user found: ${mainUser.name} (${mainUser.role})`);
  }

  // Create additional users (buyers and farmers) for interactions
  console.log("\n👥 Creating additional users...");
  
  const additionalUsers = [
    {
      id: "buyer_seed_001",
      name: "Rajesh Kumar",
      email: "rajesh.buyer@demo.com",
      role: "BUYER" as const,
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91 9876543210",
      trustScore: 90,
      avgRating: 4.8,
      totalRatings: 25,
    },
    {
      id: "buyer_seed_002",
      name: "Priya Sharma",
      email: "priya.buyer@demo.com",
      role: "BUYER" as const,
      city: "Delhi",
      state: "Delhi",
      phone: "+91 9876543211",
      trustScore: 78,
      avgRating: 4.2,
      totalRatings: 8,
    },
    {
      id: "buyer_seed_003",
      name: "Amit Patel",
      email: "amit.buyer@demo.com",
      role: "BUYER" as const,
      city: "Ahmedabad",
      state: "Gujarat",
      phone: "+91 9876543212",
      trustScore: 92,
      avgRating: 4.9,
      totalRatings: 45,
    },
    {
      id: "farmer_seed_001",
      name: "Suresh Reddy",
      email: "suresh.farmer@demo.com",
      role: "FARMER" as const,
      city: "Hyderabad",
      state: "Telangana",
      phone: "+91 9876543213",
      trustScore: 88,
      avgRating: 4.6,
      totalRatings: 18,
    },
    {
      id: "farmer_seed_002",
      name: "Meena Devi",
      email: "meena.farmer@demo.com",
      role: "FARMER" as const,
      city: "Jaipur",
      state: "Rajasthan",
      phone: "+91 9876543214",
      trustScore: 75,
      avgRating: 4.0,
      totalRatings: 6,
    },
  ];

  for (const user of additionalUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log(`✅ Created ${additionalUsers.length} additional users`);

  // Create Crop Listings for the main user (as farmer)
  console.log("\n🌾 Creating crop listings...");
  
  const cropListings = [
    {
      id: "listing_seed_001",
      farmerId: MAIN_USER_ID,
      cropName: "Wheat",
      category: "GRAINS" as const,
      quantity: 50,
      unit: "quintal",
      expectedPrice: 2200,
      minPrice: 2000,
      description: "Premium quality wheat from organic farming. No pesticides used. Suitable for flour mills.",
      qualityGrade: "A",
      isCertified: true,
      certifications: ["Organic", "FSSAI"],
      images: [],
      harvestLocation: "Pune, Maharashtra",
      harvestDate: new Date("2026-01-15"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-15"),
      aiPredictedPrice: 2350,
      aiSellTimeSuggestion: "Prices expected to rise by 8% in next 2 weeks. Consider holding.",
      aiConfidenceScore: 0.85,
    },
    {
      id: "listing_seed_002",
      farmerId: MAIN_USER_ID,
      cropName: "Rice (Basmati)",
      category: "GRAINS" as const,
      quantity: 30,
      unit: "quintal",
      expectedPrice: 4500,
      minPrice: 4200,
      description: "Long grain Basmati rice, aged for 12 months. Excellent aroma and taste.",
      qualityGrade: "Premium",
      isCertified: true,
      certifications: ["GI Tagged"],
      images: [],
      harvestLocation: "Pune, Maharashtra",
      harvestDate: new Date("2025-11-20"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-02-28"),
      aiPredictedPrice: 4800,
      aiSellTimeSuggestion: "Wedding season approaching. Good time to sell.",
      aiConfidenceScore: 0.78,
    },
    {
      id: "listing_seed_003",
      farmerId: MAIN_USER_ID,
      cropName: "Tomatoes",
      category: "VEGETABLES" as const,
      quantity: 20,
      unit: "quintal",
      expectedPrice: 1800,
      minPrice: 1500,
      description: "Fresh red tomatoes, perfect for processing or retail. Harvested this week.",
      qualityGrade: "A",
      isCertified: false,
      certifications: [],
      images: [],
      harvestLocation: "Nashik, Maharashtra",
      harvestDate: new Date("2026-01-28"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-02-10"),
      aiPredictedPrice: 2100,
      aiSellTimeSuggestion: "Supply shortage expected. Prices may increase by 15%.",
      aiConfidenceScore: 0.72,
    },
    {
      id: "listing_seed_004",
      farmerId: MAIN_USER_ID,
      cropName: "Onions",
      category: "VEGETABLES" as const,
      quantity: 40,
      unit: "quintal",
      expectedPrice: 1200,
      minPrice: 1000,
      description: "Red onions, medium size, stored in cold storage. 3 months shelf life.",
      qualityGrade: "B",
      isCertified: false,
      certifications: [],
      images: [],
      harvestLocation: "Nashik, Maharashtra",
      harvestDate: new Date("2025-12-15"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-30"),
      aiPredictedPrice: 1350,
      aiSellTimeSuggestion: "Export demand rising. Good opportunity to sell.",
      aiConfidenceScore: 0.80,
    },
    {
      id: "listing_seed_005",
      farmerId: MAIN_USER_ID,
      cropName: "Mangoes (Alphonso)",
      category: "FRUITS" as const,
      quantity: 15,
      unit: "quintal",
      expectedPrice: 8000,
      minPrice: 7500,
      description: "Premium Alphonso mangoes from Ratnagiri. First batch of the season.",
      qualityGrade: "Export",
      isCertified: true,
      certifications: ["GI Tagged", "Export Quality"],
      images: [],
      harvestLocation: "Ratnagiri, Maharashtra",
      harvestDate: new Date("2026-04-01"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-04-30"),
      aiPredictedPrice: 9500,
      aiSellTimeSuggestion: "Early season premium. Book advance orders.",
      aiConfidenceScore: 0.88,
    },
  ];

  for (const listing of cropListings) {
    await prisma.cropListing.upsert({
      where: { id: listing.id },
      update: listing,
      create: listing,
    });
  }
  console.log(`✅ Created ${cropListings.length} crop listings`);

  // Create Bids on the listings
  console.log("\n💰 Creating bids...");
  
  const bids = [
    {
      id: "bid_seed_001",
      listingId: "listing_seed_001",
      buyerId: "buyer_seed_001",
      bidAmount: 2150,
      quantity: 25,
      totalAmount: 53750,
      message: "I'm interested in buying 25 quintals of wheat for my flour mill in Mumbai. Can you deliver?",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_002",
      listingId: "listing_seed_001",
      buyerId: "buyer_seed_002",
      bidAmount: 2100,
      quantity: 50,
      totalAmount: 105000,
      message: "Will buy the entire lot at ₹2100/quintal. Payment within 3 days.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_003",
      listingId: "listing_seed_002",
      buyerId: "buyer_seed_003",
      bidAmount: 4400,
      quantity: 30,
      totalAmount: 132000,
      message: "Premium Basmati for export. Need quality certificate. Full payment upfront.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_004",
      listingId: "listing_seed_003",
      buyerId: "buyer_seed_001",
      bidAmount: 1700,
      quantity: 20,
      totalAmount: 34000,
      message: "Fresh tomatoes for restaurant chain. Weekly supply needed.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_005",
      listingId: "listing_seed_004",
      buyerId: "buyer_seed_002",
      bidAmount: 1150,
      quantity: 40,
      totalAmount: 46000,
      message: "For retail distribution in Delhi NCR.",
      status: "ACCEPTED" as const,
    },
    {
      id: "bid_seed_006",
      listingId: "listing_seed_005",
      buyerId: "buyer_seed_003",
      bidAmount: 8500,
      quantity: 15,
      totalAmount: 127500,
      message: "Export order for UAE. Need GI tag certificate and phytosanitary certificate.",
      status: "PENDING" as const,
    },
  ];

  for (const bid of bids) {
    await prisma.bid.upsert({
      where: { id: bid.id },
      update: bid,
      create: bid,
    });
  }
  console.log(`✅ Created ${bids.length} bids`);

  // Create Messages
  console.log("\n💬 Creating messages...");
  
  const messages = [
    {
      id: "msg_seed_001",
      senderId: "buyer_seed_001",
      receiverId: MAIN_USER_ID,
      content: "Hello! I saw your wheat listing. Is the quality really grade A? Can you share more photos?",
      isRead: true,
      createdAt: new Date("2026-01-28T10:30:00"),
    },
    {
      id: "msg_seed_002",
      senderId: MAIN_USER_ID,
      receiverId: "buyer_seed_001",
      content: "Yes, it's grade A quality. I can share photos. The wheat was harvested just 2 weeks ago from our organic farm.",
      isRead: true,
      createdAt: new Date("2026-01-28T10:45:00"),
    },
    {
      id: "msg_seed_003",
      senderId: "buyer_seed_001",
      receiverId: MAIN_USER_ID,
      content: "That sounds great! What's your best price for 25 quintals? I can arrange pickup from your location.",
      isRead: true,
      createdAt: new Date("2026-01-28T11:00:00"),
    },
    {
      id: "msg_seed_004",
      senderId: MAIN_USER_ID,
      receiverId: "buyer_seed_001",
      content: "For 25 quintals, I can offer ₹2150/quintal. That's ₹50 less than my asking price. Let me know!",
      isRead: false,
      createdAt: new Date("2026-01-28T11:15:00"),
    },
    {
      id: "msg_seed_005",
      senderId: "buyer_seed_003",
      receiverId: MAIN_USER_ID,
      content: "Hi, I'm interested in your Alphonso mangoes for export. Can we discuss quality specifications?",
      isRead: false,
      createdAt: new Date("2026-01-29T09:00:00"),
    },
  ];

  for (const msg of messages) {
    await prisma.message.upsert({
      where: { id: msg.id },
      update: msg,
      create: msg,
    });
  }
  console.log(`✅ Created ${messages.length} messages`);

  // Create Ratings
  console.log("\n⭐ Creating ratings...");
  
  const ratings = [
    {
      id: "rating_seed_001",
      raterId: "buyer_seed_001",
      ratedUserId: MAIN_USER_ID,
      rating: 5,
      review: "Excellent quality wheat. Delivered on time. Very professional farmer.",
    },
    {
      id: "rating_seed_002",
      raterId: "buyer_seed_002",
      ratedUserId: MAIN_USER_ID,
      rating: 4,
      review: "Good quality onions. Slightly delayed delivery but overall satisfied.",
    },
    {
      id: "rating_seed_003",
      raterId: "buyer_seed_003",
      ratedUserId: MAIN_USER_ID,
      rating: 5,
      review: "Premium Basmati rice, exactly as described. Will buy again!",
    },
    {
      id: "rating_seed_004",
      raterId: MAIN_USER_ID,
      ratedUserId: "buyer_seed_001",
      rating: 5,
      review: "Payment received on time. Very reliable buyer.",
    },
    {
      id: "rating_seed_005",
      raterId: MAIN_USER_ID,
      ratedUserId: "buyer_seed_003",
      rating: 5,
      review: "Professional export buyer. Clear communication and prompt payment.",
    },
  ];

  for (const rating of ratings) {
    await prisma.rating.upsert({
      where: { id: rating.id },
      update: rating,
      create: rating,
    });
  }
  console.log(`✅ Created ${ratings.length} ratings`);

  // Create Mandi Prices (Market Data)
  console.log("\n📊 Creating mandi prices...");
  
  const mandiPrices = [
    // Wheat prices
    { cropName: "Wheat", variety: "Sharbati", mandiName: "Lasalgaon", state: "Maharashtra", district: "Nashik", minPrice: 2000, maxPrice: 2400, modalPrice: 2200, priceDate: new Date("2026-01-30") },
    { cropName: "Wheat", variety: "Lokwan", mandiName: "Pune", state: "Maharashtra", district: "Pune", minPrice: 1900, maxPrice: 2300, modalPrice: 2100, priceDate: new Date("2026-01-30") },
    { cropName: "Wheat", variety: "Sharbati", mandiName: "Indore", state: "Madhya Pradesh", district: "Indore", minPrice: 2100, maxPrice: 2500, modalPrice: 2300, priceDate: new Date("2026-01-30") },
    
    // Rice prices
    { cropName: "Rice (Basmati)", variety: "1121", mandiName: "Karnal", state: "Haryana", district: "Karnal", minPrice: 4200, maxPrice: 4800, modalPrice: 4500, priceDate: new Date("2026-01-30") },
    { cropName: "Rice (Basmati)", variety: "Pusa", mandiName: "Delhi", state: "Delhi", district: "New Delhi", minPrice: 4000, maxPrice: 4600, modalPrice: 4300, priceDate: new Date("2026-01-30") },
    
    // Tomato prices
    { cropName: "Tomatoes", variety: "Local", mandiName: "Pune", state: "Maharashtra", district: "Pune", minPrice: 1500, maxPrice: 2200, modalPrice: 1800, priceDate: new Date("2026-01-30") },
    { cropName: "Tomatoes", variety: "Hybrid", mandiName: "Mumbai", state: "Maharashtra", district: "Mumbai", minPrice: 1800, maxPrice: 2500, modalPrice: 2100, priceDate: new Date("2026-01-30") },
    
    // Onion prices
    { cropName: "Onions", variety: "Red", mandiName: "Lasalgaon", state: "Maharashtra", district: "Nashik", minPrice: 1000, maxPrice: 1500, modalPrice: 1200, priceDate: new Date("2026-01-30") },
    { cropName: "Onions", variety: "White", mandiName: "Lasalgaon", state: "Maharashtra", district: "Nashik", minPrice: 1100, maxPrice: 1600, modalPrice: 1350, priceDate: new Date("2026-01-30") },
    
    // Mango prices
    { cropName: "Mangoes (Alphonso)", variety: "Alphonso", mandiName: "Ratnagiri", state: "Maharashtra", district: "Ratnagiri", minPrice: 7500, maxPrice: 10000, modalPrice: 8500, priceDate: new Date("2026-01-30") },
    
    // More crops
    { cropName: "Potato", variety: "Jyoti", mandiName: "Pune", state: "Maharashtra", district: "Pune", minPrice: 800, maxPrice: 1200, modalPrice: 1000, priceDate: new Date("2026-01-30") },
    { cropName: "Soybean", variety: "Yellow", mandiName: "Indore", state: "Madhya Pradesh", district: "Indore", minPrice: 4500, maxPrice: 5200, modalPrice: 4800, priceDate: new Date("2026-01-30") },
    { cropName: "Cotton", variety: "Long Staple", mandiName: "Rajkot", state: "Gujarat", district: "Rajkot", minPrice: 6000, maxPrice: 7000, modalPrice: 6500, priceDate: new Date("2026-01-30") },
    { cropName: "Groundnut", variety: "Bold", mandiName: "Junagadh", state: "Gujarat", district: "Junagadh", minPrice: 5500, maxPrice: 6500, modalPrice: 6000, priceDate: new Date("2026-01-30") },
    { cropName: "Chilli", variety: "Teja", mandiName: "Guntur", state: "Andhra Pradesh", district: "Guntur", minPrice: 12000, maxPrice: 15000, modalPrice: 13500, priceDate: new Date("2026-01-30") },
  ];

  // Delete old mandi prices and insert fresh ones
  await prisma.mandiPrice.deleteMany({});
  await prisma.mandiPrice.createMany({
    data: mandiPrices,
  });
  console.log(`✅ Created ${mandiPrices.length} mandi prices`);

  // Create AI Predictions
  console.log("\n🤖 Creating AI predictions...");
  
  const aiPredictions = [
    {
      cropName: "Wheat",
      state: "Maharashtra",
      district: "Pune",
      predictedPrice: 2350,
      confidence: 0.85,
      sellTimeSuggestion: "Hold for 2-3 weeks. Prices expected to rise due to reduced supply from MP.",
      factors: { supply: "low", demand: "high", weather: "favorable", season: "peak" },
      validUntil: new Date("2026-02-15"),
    },
    {
      cropName: "Rice (Basmati)",
      state: "Maharashtra",
      district: "Pune",
      predictedPrice: 4800,
      confidence: 0.78,
      sellTimeSuggestion: "Good time to sell. Wedding season demand is high.",
      factors: { supply: "moderate", demand: "very_high", export: "strong", festival: "wedding_season" },
      validUntil: new Date("2026-02-28"),
    },
    {
      cropName: "Tomatoes",
      state: "Maharashtra",
      district: "Pune",
      predictedPrice: 2100,
      confidence: 0.72,
      sellTimeSuggestion: "Sell quickly. Perishable crop with rising prices.",
      factors: { supply: "shortage", demand: "high", weather: "cold_wave", shelf_life: "limited" },
      validUntil: new Date("2026-02-10"),
    },
    {
      cropName: "Onions",
      state: "Maharashtra",
      district: "Nashik",
      predictedPrice: 1400,
      confidence: 0.80,
      sellTimeSuggestion: "Export demand rising. Consider selling to exporters.",
      factors: { supply: "adequate", demand: "rising", export: "bangladesh_demand", storage: "good" },
      validUntil: new Date("2026-03-15"),
    },
    {
      cropName: "Mangoes (Alphonso)",
      state: "Maharashtra",
      district: "Ratnagiri",
      predictedPrice: 9500,
      confidence: 0.88,
      sellTimeSuggestion: "Premium early season pricing. Book advance orders.",
      factors: { supply: "early_season", demand: "very_high", quality: "premium", export: "uae_dubai" },
      validUntil: new Date("2026-04-30"),
    },
  ];

  await prisma.aIPrediction.deleteMany({});
  await prisma.aIPrediction.createMany({
    data: aiPredictions,
  });
  console.log(`✅ Created ${aiPredictions.length} AI predictions`);

  console.log("\n✅ Database seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Main User ID: ${MAIN_USER_ID}`);
  console.log(`   - Additional Users: ${additionalUsers.length}`);
  console.log(`   - Crop Listings: ${cropListings.length}`);
  console.log(`   - Bids: ${bids.length}`);
  console.log(`   - Messages: ${messages.length}`);
  console.log(`   - Ratings: ${ratings.length}`);
  console.log(`   - Mandi Prices: ${mandiPrices.length}`);
  console.log(`   - AI Predictions: ${aiPredictions.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
