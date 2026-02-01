
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
const MAIN_USER_ID = "cml0x03rg000ifp8odmtt8r46";

async function main() {
  console.log("🌱 Starting database seed...");
  const mainUser = await prisma.user.findUnique({
    where: { id: MAIN_USER_ID },
  });

  if (!mainUser) {
    console.log(" Main user not found. Creating...");
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
    console.log(" Main user created");
  } else {
    console.log(` Main user found: ${mainUser.name} (${mainUser.role})`);
  }

  console.log("\n Creating additional users...");
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
      id: "buyer_seed_004",
      name: "Vikram Singh",
      email: "vikram.buyer@demo.com",
      role: "BUYER" as const,
      city: "Bangalore",
      state: "Karnataka",
      phone: "+91 9876543215",
      trustScore: 85,
      avgRating: 4.5,
      totalRatings: 20,
    },
    {
      id: "buyer_seed_005",
      name: "Fatima Khan",
      email: "fatima.buyer@demo.com",
      role: "BUYER" as const,
      city: "Lucknow",
      state: "Uttar Pradesh",
      phone: "+91 9876543216",
      trustScore: 88,
      avgRating: 4.7,
      totalRatings: 32,
    },
    {
      id: "buyer_seed_006",
      name: "Sanjay Verma",
      email: "sanjay.buyer@demo.com",
      role: "BUYER" as const,
      city: "Chandigarh",
      state: "Punjab",
      phone: "+91 9876543217",
      trustScore: 82,
      avgRating: 4.4,
      totalRatings: 15,
    },
    {
      id: "buyer_seed_007",
      name: "Deepika Nair",
      email: "deepika.buyer@demo.com",
      role: "BUYER" as const,
      city: "Kochi",
      state: "Kerala",
      phone: "+91 9876543218",
      trustScore: 91,
      avgRating: 4.8,
      totalRatings: 38,
    },
    {
      id: "buyer_seed_008",
      name: "Arvind Desai",
      email: "arvind.buyer@demo.com",
      role: "BUYER" as const,
      city: "Nagpur",
      state: "Maharashtra",
      phone: "+91 9876543219",
      trustScore: 80,
      avgRating: 4.3,
      totalRatings: 12,
    },
    {
      id: "buyer_seed_009",
      name: "Ishita Roy",
      email: "ishita.buyer@demo.com",
      role: "BUYER" as const,
      city: "Kolkata",
      state: "West Bengal",
      phone: "+91 9876543220",
      trustScore: 87,
      avgRating: 4.6,
      totalRatings: 28,
    },
    {
      id: "buyer_seed_010",
      name: "Manoj Gupta",
      email: "manoj.buyer@demo.com",
      role: "BUYER" as const,
      city: "Indore",
      state: "Madhya Pradesh",
      phone: "+91 9876543221",
      trustScore: 83,
      avgRating: 4.4,
      totalRatings: 18,
    },
    {
      id: "buyer_seed_011",
      name: "Sneha Patel",
      email: "sneha.buyer@demo.com",
      role: "BUYER" as const,
      city: "Surat",
      state: "Gujarat",
      phone: "+91 9876543222",
      trustScore: 89,
      avgRating: 4.7,
      totalRatings: 35,
    },
    {
      id: "buyer_seed_012",
      name: "Rahul Joshi",
      email: "rahul.buyer@demo.com",
      role: "BUYER" as const,
      city: "Vadodara",
      state: "Gujarat",
      phone: "+91 9876543223",
      trustScore: 81,
      avgRating: 4.3,
      totalRatings: 22,
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
    {
      id: "farmer_seed_003",
      name: "Harpreet Singh",
      email: "harpreet.farmer@demo.com",
      role: "FARMER" as const,
      city: "Ludhiana",
      state: "Punjab",
      phone: "+91 9876543224",
      trustScore: 89,
      avgRating: 4.7,
      totalRatings: 30,
    },
    {
      id: "farmer_seed_004",
      name: "Lakshmi Amma",
      email: "lakshmi.farmer@demo.com",
      role: "FARMER" as const,
      city: "Thrissur",
      state: "Kerala",
      phone: "+91 9876543225",
      trustScore: 86,
      avgRating: 4.5,
      totalRatings: 22,
    },
    {
      id: "farmer_seed_005",
      name: "Bhavesh Parmar",
      email: "bhavesh.farmer@demo.com",
      role: "FARMER" as const,
      city: "Gandhinagar",
      state: "Gujarat",
      phone: "+91 9876543226",
      trustScore: 84,
      avgRating: 4.4,
      totalRatings: 16,
    },
    {
      id: "farmer_seed_006",
      name: "Anupam Das",
      email: "anupam.farmer@demo.com",
      role: "FARMER" as const,
      city: "Bankura",
      state: "West Bengal",
      phone: "+91 9876543227",
      trustScore: 77,
      avgRating: 4.1,
      totalRatings: 9,
    },
    {
      id: "farmer_seed_007",
      name: "Chitra Singh",
      email: "chitra.farmer@demo.com",
      role: "FARMER" as const,
      city: "Bhopal",
      state: "Madhya Pradesh",
      phone: "+91 9876543228",
      trustScore: 85,
      avgRating: 4.5,
      totalRatings: 25,
    },
    {
      id: "farmer_seed_008",
      name: "Ramesh Rao",
      email: "ramesh.farmer@demo.com",
      role: "FARMER" as const,
      city: "Belgaum",
      state: "Karnataka",
      phone: "+91 9876543229",
      trustScore: 82,
      avgRating: 4.3,
      totalRatings: 14,
    },
    {
      id: "farmer_seed_009",
      name: "Prabhu Kumar",
      email: "prabhu.farmer@demo.com",
      role: "FARMER" as const,
      city: "Salem",
      state: "Tamil Nadu",
      phone: "+91 9876543230",
      trustScore: 80,
      avgRating: 4.2,
      totalRatings: 11,
    },
    {
      id: "farmer_seed_010",
      name: "Gokul Nath",
      email: "gokul.farmer@demo.com",
      role: "FARMER" as const,
      city: "Belgaum",
      state: "Karnataka",
      phone: "+91 9876543231",
      trustScore: 87,
      avgRating: 4.6,
      totalRatings: 29,
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
    
    
    {
      id: "listing_seed_006",
      farmerId: "farmer_seed_001",
      cropName: "Rice",
      category: "GRAINS" as const,
      quantity: 60,
      unit: "quintal",
      expectedPrice: 2800,
      minPrice: 2600,
      description: "Premium long grain rice from Telangana, suitable for export. Clean and well dried.",
      qualityGrade: "A",
      isCertified: true,
      certifications: ["GI Tagged"],
      images: [],
      harvestLocation: "Hyderabad, Telangana",
      harvestDate: new Date("2025-12-01"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-02-28"),
      aiPredictedPrice: 3000,
      aiConfidenceScore: 0.82,
    },
    {
      id: "listing_seed_007",
      farmerId: "farmer_seed_001",
      cropName: "Cotton",
      category: "OILSEEDS" as const,
      quantity: 25,
      unit: "quintal",
      expectedPrice: 6500,
      minPrice: 6000,
      description: "High quality cotton, long staple, suitable for textile industry.",
      qualityGrade: "A",
      isCertified: false,
      certifications: [],
      images: [],
      harvestLocation: "Hyderabad, Telangana",
      harvestDate: new Date("2025-11-10"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-31"),
      aiPredictedPrice: 6800,
      aiConfidenceScore: 0.80,
    },
    
    
    {
      id: "listing_seed_008",
      farmerId: "farmer_seed_002",
      cropName: "Gram (Chickpea)",
      category: "PULSES" as const,
      quantity: 35,
      unit: "quintal",
      expectedPrice: 5200,
      minPrice: 4800,
      description: "Premium quality gram dal, high protein content, organically grown.",
      qualityGrade: "A",
      isCertified: true,
      certifications: ["Organic"],
      images: [],
      harvestLocation: "Jaipur, Rajasthan",
      harvestDate: new Date("2025-12-20"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-15"),
      aiPredictedPrice: 5500,
      aiConfidenceScore: 0.79,
    },
    {
      id: "listing_seed_009",
      farmerId: "farmer_seed_002",
      cropName: "Mustard",
      category: "OILSEEDS" as const,
      quantity: 22,
      unit: "quintal",
      expectedPrice: 5800,
      minPrice: 5400,
      description: "Cold-pressed mustard seeds, high oil content, suitable for oil extraction.",
      qualityGrade: "B",
      isCertified: false,
      certifications: [],
      images: [],
      harvestLocation: "Jaipur, Rajasthan",
      harvestDate: new Date("2025-11-25"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-02-28"),
      aiPredictedPrice: 6100,
      aiConfidenceScore: 0.75,
    },
    
    
    {
      id: "listing_seed_010",
      farmerId: "farmer_seed_003",
      cropName: "Maize",
      category: "GRAINS" as const,
      quantity: 45,
      unit: "quintal",
      expectedPrice: 1900,
      minPrice: 1700,
      description: "Hybrid maize, high yield variety, suitable for animal feed and corn flour.",
      qualityGrade: "A",
      isCertified: false,
      certifications: [],
      images: [],
      harvestLocation: "Ludhiana, Punjab",
      harvestDate: new Date("2025-10-15"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-31"),
      aiPredictedPrice: 2050,
      aiConfidenceScore: 0.81,
    },
    {
      id: "listing_seed_011",
      farmerId: "farmer_seed_003",
      cropName: "Wheat",
      category: "GRAINS" as const,
      quantity: 70,
      unit: "quintal",
      expectedPrice: 2300,
      minPrice: 2100,
      description: "Premium wheat from Punjab, ideal for flour mills. Clean and good germination.",
      qualityGrade: "A",
      isCertified: true,
      certifications: ["FSSAI"],
      images: [],
      harvestLocation: "Ludhiana, Punjab",
      harvestDate: new Date("2025-12-10"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-20"),
      aiPredictedPrice: 2450,
      aiConfidenceScore: 0.84,
    },
    
    
    {
      id: "listing_seed_012",
      farmerId: "farmer_seed_004",
      cropName: "Coconut",
      category: "FRUITS" as const,
      quantity: 80,
      unit: "piece",
      expectedPrice: 50,
      minPrice: 45,
      description: "Fresh coconuts, mature stage, suitable for coconut oil and copra production.",
      qualityGrade: "A",
      isCertified: false,
      certifications: [],
      images: [],
      harvestLocation: "Thrissur, Kerala",
      harvestDate: new Date("2026-01-20"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-04-30"),
      aiPredictedPrice: 55,
      aiConfidenceScore: 0.77,
    },
    {
      id: "listing_seed_013",
      farmerId: "farmer_seed_004",
      cropName: "Pepper",
      category: "SPICES" as const,
      quantity: 5,
      unit: "quintal",
      expectedPrice: 45000,
      minPrice: 42000,
      description: "Black pepper, premium grade, high piperine content. Farm to table quality.",
      qualityGrade: "Premium",
      isCertified: true,
      certifications: ["GI Tagged"],
      images: [],
      harvestLocation: "Thrissur, Kerala",
      harvestDate: new Date("2025-10-30"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-04-15"),
      aiPredictedPrice: 47000,
      aiConfidenceScore: 0.86,
    },
    
    
    {
      id: "listing_seed_014",
      farmerId: "farmer_seed_005",
      cropName: "Groundnut",
      category: "OILSEEDS" as const,
      quantity: 55,
      unit: "quintal",
      expectedPrice: 6000,
      minPrice: 5500,
      description: "High yielding groundnut variety, good oil content, suitable for oil extraction.",
      qualityGrade: "A",
      isCertified: false,
      certifications: [],
      images: [],
      harvestLocation: "Gandhinagar, Gujarat",
      harvestDate: new Date("2025-11-30"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-31"),
      aiPredictedPrice: 6300,
      aiConfidenceScore: 0.80,
    },
    {
      id: "listing_seed_015",
      farmerId: "farmer_seed_005",
      cropName: "Cotton",
      category: "OILSEEDS" as const,
      quantity: 30,
      unit: "quintal",
      expectedPrice: 6200,
      minPrice: 5800,
      description: "Bt cotton, certified seeds, high yield, low pesticide requirement.",
      qualityGrade: "A",
      isCertified: true,
      certifications: ["Certified Bt"],
      images: [],
      harvestLocation: "Gandhinagar, Gujarat",
      harvestDate: new Date("2025-12-05"),
      status: "ACTIVE" as const,
      expiresAt: new Date("2026-03-15"),
      aiPredictedPrice: 6500,
      aiConfidenceScore: 0.82,
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
    
    
    {
      id: "bid_seed_007",
      listingId: "listing_seed_006",
      buyerId: "buyer_seed_004",
      bidAmount: 2900,
      quantity: 60,
      totalAmount: 174000,
      message: "Good quality rice for export market. Will arrange transportation.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_008",
      listingId: "listing_seed_006",
      buyerId: "buyer_seed_005",
      bidAmount: 2850,
      quantity: 30,
      totalAmount: 85500,
      message: "Bulk order for restaurant supply chain. Need bulk discount.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_009",
      listingId: "listing_seed_007",
      buyerId: "buyer_seed_006",
      bidAmount: 6300,
      quantity: 25,
      totalAmount: 157500,
      message: "High quality cotton for textile mill. Need certificates.",
      status: "ACCEPTED" as const,
    },
    
    
    {
      id: "bid_seed_010",
      listingId: "listing_seed_008",
      buyerId: "buyer_seed_007",
      bidAmount: 5300,
      quantity: 35,
      totalAmount: 185500,
      message: "Organic chickpea for export to EU market. Need organic certification.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_011",
      listingId: "listing_seed_009",
      buyerId: "buyer_seed_008",
      bidAmount: 5900,
      quantity: 22,
      totalAmount: 129800,
      message: "Mustard seeds for oil extraction. Cold press quality appreciated.",
      status: "PENDING" as const,
    },
    
    
    {
      id: "bid_seed_012",
      listingId: "listing_seed_010",
      buyerId: "buyer_seed_009",
      bidAmount: 1950,
      quantity: 45,
      totalAmount: 87750,
      message: "Maize for animal feed manufacturing. Bulk order required.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_013",
      listingId: "listing_seed_011",
      buyerId: "buyer_seed_010",
      bidAmount: 2400,
      quantity: 70,
      totalAmount: 168000,
      message: "Premium wheat for flour mill. Need quality assurance report.",
      status: "ACCEPTED" as const,
    },
    {
      id: "bid_seed_014",
      listingId: "listing_seed_011",
      buyerId: "buyer_seed_011",
      bidAmount: 2350,
      quantity: 35,
      totalAmount: 82250,
      message: "Good quality wheat for bakery. Consistent supply needed.",
      status: "PENDING" as const,
    },
    
    
    {
      id: "bid_seed_015",
      listingId: "listing_seed_012",
      buyerId: "buyer_seed_012",
      bidAmount: 52,
      quantity: 80,
      totalAmount: 4160,
      message: "Fresh coconuts for retail and processing. Weekly supply possible?",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_016",
      listingId: "listing_seed_013",
      buyerId: "buyer_seed_003",
      bidAmount: 46000,
      quantity: 5,
      totalAmount: 230000,
      message: "Premium black pepper for spice export. GI tag appreciated.",
      status: "PENDING" as const,
    },
    
    
    {
      id: "bid_seed_017",
      listingId: "listing_seed_014",
      buyerId: "buyer_seed_004",
      bidAmount: 6100,
      quantity: 55,
      totalAmount: 335500,
      message: "Groundnut for oil extraction. High volume purchase.",
      status: "PENDING" as const,
    },
    {
      id: "bid_seed_018",
      listingId: "listing_seed_015",
      buyerId: "buyer_seed_005",
      bidAmount: 6400,
      quantity: 30,
      totalAmount: 192000,
      message: "Bt cotton for textile mill. Need certification documents.",
      status: "ACCEPTED" as const,
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
    
    
    {
      id: "msg_seed_006",
      senderId: "buyer_seed_004",
      receiverId: "farmer_seed_001",
      content: "Your rice quality looks good. Can you provide export documentation?",
      isRead: true,
      createdAt: new Date("2026-01-27T14:30:00"),
    },
    {
      id: "msg_seed_007",
      senderId: "farmer_seed_001",
      receiverId: "buyer_seed_004",
      content: "Yes, I have all export documents including phytosanitary certificate.",
      isRead: true,
      createdAt: new Date("2026-01-27T15:00:00"),
    },
    
    
    {
      id: "msg_seed_008",
      senderId: "buyer_seed_010",
      receiverId: "farmer_seed_003",
      content: "Do you have consistent supply of premium wheat throughout the year?",
      isRead: false,
      createdAt: new Date("2026-01-29T10:15:00"),
    },
    {
      id: "msg_seed_009",
      senderId: "farmer_seed_003",
      receiverId: "buyer_seed_010",
      content: "Yes, we have 2 harvests per year. Can supply 100 quintals per month.",
      isRead: false,
      createdAt: new Date("2026-01-29T11:00:00"),
    },
    
    
    {
      id: "msg_seed_010",
      senderId: "buyer_seed_003",
      receiverId: "farmer_seed_004",
      content: "Your black pepper looks premium. What's the minimum order quantity?",
      isRead: true,
      createdAt: new Date("2026-01-28T08:00:00"),
    },
    {
      id: "msg_seed_011",
      senderId: "farmer_seed_004",
      receiverId: "buyer_seed_003",
      content: "MOQ is 1 quintal. Can supply throughout the year. GI certified.",
      isRead: true,
      createdAt: new Date("2026-01-28T09:30:00"),
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
    
    
    {
      id: "rating_seed_006",
      raterId: "buyer_seed_004",
      ratedUserId: "farmer_seed_001",
      rating: 5,
      review: "Excellent rice quality. Export-ready. Very professional.",
    },
    {
      id: "rating_seed_007",
      raterId: "buyer_seed_006",
      ratedUserId: "farmer_seed_001",
      rating: 5,
      review: "High quality cotton. Certification documents provided. Reliable.",
    },
    {
      id: "rating_seed_008",
      raterId: "farmer_seed_001",
      ratedUserId: "buyer_seed_004",
      rating: 5,
      review: "Excellent buyer. Professional and trustworthy.",
    },
    
    
    {
      id: "rating_seed_009",
      raterId: "buyer_seed_007",
      ratedUserId: "farmer_seed_002",
      rating: 4,
      review: "Good organic gram quality. Fair pricing.",
    },
    {
      id: "rating_seed_010",
      raterId: "buyer_seed_008",
      ratedUserId: "farmer_seed_002",
      rating: 4,
      review: "Good mustard seeds. Competitive price.",
    },
    
    
    {
      id: "rating_seed_011",
      raterId: "buyer_seed_009",
      ratedUserId: "farmer_seed_003",
      rating: 5,
      review: "High quality maize. Good communication and quick delivery.",
    },
    {
      id: "rating_seed_012",
      raterId: "buyer_seed_010",
      ratedUserId: "farmer_seed_003",
      rating: 5,
      review: "Premium wheat. Consistent quality. Very professional.",
    },
    {
      id: "rating_seed_013",
      raterId: "farmer_seed_003",
      ratedUserId: "buyer_seed_010",
      rating: 5,
      review: "Excellent buyer. Bulk orders handled smoothly.",
    },
    
    
    {
      id: "rating_seed_014",
      raterId: "buyer_seed_012",
      ratedUserId: "farmer_seed_004",
      rating: 5,
      review: "Fresh coconuts. Good quality. Reliable supply.",
    },
    {
      id: "rating_seed_015",
      raterId: "buyer_seed_003",
      ratedUserId: "farmer_seed_004",
      rating: 5,
      review: "Premium black pepper. GI certified. Excellent.",
    },
    
    
    {
      id: "rating_seed_016",
      raterId: "buyer_seed_004",
      ratedUserId: "farmer_seed_005",
      rating: 5,
      review: "High quality groundnut. Good oil content.",
    },
    {
      id: "rating_seed_017",
      raterId: "buyer_seed_005",
      ratedUserId: "farmer_seed_005",
      rating: 5,
      review: "Certified Bt cotton. Professional seller.",
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

  console.log("\n📊 Creating mandi prices...");
  const mandiPrices = [
    { cropName: "Wheat", variety: "Sharbati", mandiName: "Lasalgaon", state: "Maharashtra", district: "Nashik", minPrice: 2000, maxPrice: 2400, modalPrice: 2200, priceDate: new Date("2026-01-30") },
    { cropName: "Wheat", variety: "Lokwan", mandiName: "Pune", state: "Maharashtra", district: "Pune", minPrice: 1900, maxPrice: 2300, modalPrice: 2100, priceDate: new Date("2026-01-30") },
    { cropName: "Wheat", variety: "Sharbati", mandiName: "Indore", state: "Madhya Pradesh", district: "Indore", minPrice: 2100, maxPrice: 2500, modalPrice: 2300, priceDate: new Date("2026-01-30") },
    { cropName: "Wheat", variety: "PBW", mandiName: "Karnal", state: "Haryana", district: "Karnal", minPrice: 2200, maxPrice: 2600, modalPrice: 2400, priceDate: new Date("2026-01-30") },
    { cropName: "Wheat", variety: "Sharbati", mandiName: "Delhi", state: "Delhi", district: "New Delhi", minPrice: 2150, maxPrice: 2550, modalPrice: 2350, priceDate: new Date("2026-01-30") },
    
    
    { cropName: "Rice (Basmati)", variety: "1121", mandiName: "Karnal", state: "Haryana", district: "Karnal", minPrice: 4200, maxPrice: 4800, modalPrice: 4500, priceDate: new Date("2026-01-30") },
    { cropName: "Rice (Basmati)", variety: "Pusa", mandiName: "Delhi", state: "Delhi", district: "New Delhi", minPrice: 4000, maxPrice: 4600, modalPrice: 4300, priceDate: new Date("2026-01-30") },
    { cropName: "Rice", variety: "Regular", mandiName: "Hyderabad", state: "Telangana", district: "Hyderabad", minPrice: 2500, maxPrice: 3000, modalPrice: 2750, priceDate: new Date("2026-01-30") },
    { cropName: "Rice", variety: "Regular", mandiName: "Mumbai", state: "Maharashtra", district: "Mumbai", minPrice: 2700, maxPrice: 3200, modalPrice: 2950, priceDate: new Date("2026-01-30") },
    
    
    { cropName: "Tomatoes", variety: "Local", mandiName: "Pune", state: "Maharashtra", district: "Pune", minPrice: 1500, maxPrice: 2200, modalPrice: 1800, priceDate: new Date("2026-01-30") },
    { cropName: "Tomatoes", variety: "Hybrid", mandiName: "Mumbai", state: "Maharashtra", district: "Mumbai", minPrice: 1800, maxPrice: 2500, modalPrice: 2100, priceDate: new Date("2026-01-30") },
    { cropName: "Tomatoes", variety: "Local", mandiName: "Delhi", state: "Delhi", district: "New Delhi", minPrice: 1600, maxPrice: 2300, modalPrice: 1950, priceDate: new Date("2026-01-30") },
    
    
    { cropName: "Onions", variety: "Red", mandiName: "Lasalgaon", state: "Maharashtra", district: "Nashik", minPrice: 1000, maxPrice: 1500, modalPrice: 1200, priceDate: new Date("2026-01-30") },
    { cropName: "Onions", variety: "White", mandiName: "Lasalgaon", state: "Maharashtra", district: "Nashik", minPrice: 1100, maxPrice: 1600, modalPrice: 1350, priceDate: new Date("2026-01-30") },
    { cropName: "Onions", variety: "Red", mandiName: "Mumbai", state: "Maharashtra", district: "Mumbai", minPrice: 1200, maxPrice: 1700, modalPrice: 1450, priceDate: new Date("2026-01-30") },
    
    
    { cropName: "Mangoes (Alphonso)", variety: "Alphonso", mandiName: "Ratnagiri", state: "Maharashtra", district: "Ratnagiri", minPrice: 7500, maxPrice: 10000, modalPrice: 8500, priceDate: new Date("2026-01-30") },
    
    
    { cropName: "Potato", variety: "Jyoti", mandiName: "Pune", state: "Maharashtra", district: "Pune", minPrice: 800, maxPrice: 1200, modalPrice: 1000, priceDate: new Date("2026-01-30") },
    { cropName: "Soybean", variety: "Yellow", mandiName: "Indore", state: "Madhya Pradesh", district: "Indore", minPrice: 4500, maxPrice: 5200, modalPrice: 4800, priceDate: new Date("2026-01-30") },
    { cropName: "Cotton", variety: "Long Staple", mandiName: "Rajkot", state: "Gujarat", district: "Rajkot", minPrice: 6000, maxPrice: 7000, modalPrice: 6500, priceDate: new Date("2026-01-30") },
    { cropName: "Groundnut", variety: "Bold", mandiName: "Junagadh", state: "Gujarat", district: "Junagadh", minPrice: 5500, maxPrice: 6500, modalPrice: 6000, priceDate: new Date("2026-01-30") },
    { cropName: "Chilli", variety: "Teja", mandiName: "Guntur", state: "Andhra Pradesh", district: "Guntur", minPrice: 12000, maxPrice: 15000, modalPrice: 13500, priceDate: new Date("2026-01-30") },
    { cropName: "Gram (Chickpea)", variety: "Kabuli", mandiName: "Jaipur", state: "Rajasthan", district: "Jaipur", minPrice: 5000, maxPrice: 5800, modalPrice: 5400, priceDate: new Date("2026-01-30") },
    { cropName: "Mustard", variety: "Yellow", mandiName: "Jaipur", state: "Rajasthan", district: "Jaipur", minPrice: 5400, maxPrice: 6200, modalPrice: 5800, priceDate: new Date("2026-01-30") },
    { cropName: "Maize", variety: "Hybrid", mandiName: "Ludhiana", state: "Punjab", district: "Ludhiana", minPrice: 1700, maxPrice: 2100, modalPrice: 1900, priceDate: new Date("2026-01-30") },
    { cropName: "Coconut", variety: "Mature", mandiName: "Thrissur", state: "Kerala", district: "Thrissur", minPrice: 45, maxPrice: 60, modalPrice: 50, priceDate: new Date("2026-01-30") },
    { cropName: "Pepper", variety: "Black", mandiName: "Thrissur", state: "Kerala", district: "Thrissur", minPrice: 40000, maxPrice: 50000, modalPrice: 45000, priceDate: new Date("2026-01-30") },
  ];

  await prisma.mandiPrice.deleteMany({});
  await prisma.mandiPrice.createMany({
    data: mandiPrices,
  });
  console.log(`✅ Created ${mandiPrices.length} mandi prices`);

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
      cropName: "Wheat",
      state: "Haryana",
      district: "Karnal",
      predictedPrice: 2480,
      confidence: 0.83,
      sellTimeSuggestion: "Good time to sell. Export demand from Bangladesh rising.",
      factors: { supply: "moderate", demand: "high", export: "strong", season: "peak" },
      validUntil: new Date("2026-02-20"),
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
      cropName: "Rice",
      state: "Telangana",
      district: "Hyderabad",
      predictedPrice: 2900,
      confidence: 0.80,
      sellTimeSuggestion: "Export demand strong. Good time to sell.",
      factors: { supply: "adequate", demand: "high", export: "bangladesh_vietnam" },
      validUntil: new Date("2026-02-25"),
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
    {
      cropName: "Cotton",
      state: "Gujarat",
      district: "Rajkot",
      predictedPrice: 6800,
      confidence: 0.82,
      sellTimeSuggestion: "Textile demand rising. Good time to sell.",
      factors: { supply: "moderate", demand: "high", industry: "textile", export: "china" },
      validUntil: new Date("2026-03-31"),
    },
    {
      cropName: "Groundnut",
      state: "Gujarat",
      district: "Junagadh",
      predictedPrice: 6300,
      confidence: 0.79,
      sellTimeSuggestion: "Oil extraction demand stable. Fair prices expected.",
      factors: { supply: "adequate", demand: "moderate", use: "oil_extraction", season: "post_harvest" },
      validUntil: new Date("2026-03-20"),
    },
    {
      cropName: "Gram (Chickpea)",
      state: "Rajasthan",
      district: "Jaipur",
      predictedPrice: 5550,
      confidence: 0.81,
      sellTimeSuggestion: "Dal demand strong. Good prices expected.",
      factors: { supply: "shortage", demand: "very_high", use: "dal_making", season: "peak" },
      validUntil: new Date("2026-03-10"),
    },
  ];

  await prisma.aIPrediction.deleteMany({});
  await prisma.aIPrediction.createMany({
    data: aiPredictions,
  });
  console.log(`✅ Created ${aiPredictions.length} AI predictions`);

  console.log("\n Database seeding completed successfully!");
  console.log("\n Summary:");
  console.log(`   - Main User ID: ${MAIN_USER_ID}`);
  console.log(`   - Additional Users: ${additionalUsers.length}`);
  console.log(`   - Crop Listings: ${cropListings.length}`);
  console.log(`   - Bids: ${bids.length}`);
  console.log(`   - Messages: ${messages.length}`);
  console.log(`   - Ratings: ${ratings.length}`);
  console.log(`   - Mandi Prices: ${mandiPrices.length}`);
  console.log(`   - AI Predictions: ${aiPredictions.length}`);
  console.log("\n Medium-Level Data Successfully Seeded!");
  console.log("   ✓ 22 Active Users (12 buyers + 10 farmers)");
  console.log("   ✓ 15 Diverse Crop Listings");
  console.log("   ✓ 18 Realistic Bids");
  console.log("   ✓ 11 Active Messages");
  console.log("   ✓ 17 User Ratings");
  console.log("   ✓ 26 Mandi Price Points");
  console.log("   ✓ 10 AI Predictions");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(" Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
