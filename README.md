# Trikernel# 🌾 AgroPulse

> Real-time market intelligence and direct market access platform for farmers

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Project Details

| Field | Details |
|-------|---------|
| **Project Name** | AgroPulse |
| **Problem Statement ID** | CS03AE |
| **Team Name** | Trikernel |
| **College** | NMAMIT |

---

## 🚨 Problem Statement

Farmers often lack access to real-time market prices, reliable demand insights, and direct connections with buyers. Current agricultural marketplaces are dominated by middlemen, delayed price updates, and fragmented information sources, which results in:

- ❌ **Unfair pricing** for farmers
- ❌ **Low bargaining power**
- ❌ **Inability to decide** the right time and place to sell produce

This leads to **reduced farmer income** and **inefficient agricultural trade**.

---

## 💡 Proposed Solution

**AgroPulse** is a real-time market intelligence and direct market access platform designed specifically for farmers.

### The platform:

- 📊 **Aggregates live mandi prices** and market data
- 🤖 **Uses AI/ML** to predict price trends and suggest optimal selling times
- 🤝 **Enables direct farmer-to-buyer interaction**, removing middlemen
- ⚡ **Supports real-time bidding**, smart buyer–farmer matching, and transparent pricing

> AgroPulse transforms raw data into actionable intelligence, empowering farmers to make profitable decisions.

---

## ✨ Innovation & Creativity

What makes AgroPulse unique:

### 📈 Price Prediction Intelligence
AI-based forecasting helps farmers decide **when** to sell, not just where.

### 🔄 Real-Time Direct Market Access
Farmers list produce and buyers place live bids, ensuring fair competition.

### 🎯 Smart Matchmaking Engine
Buyers and farmers are matched based on distance, quantity, price expectations, and trust ratings.

### 📱 Farmer-First Design
Simple, mobile-first UI with regional language readiness and future voice-based interactions.

> Unlike existing platforms that only show prices, **AgroPulse guides decisions and enables action**.

---

## 🛠️ Technical Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js** (App Router) | React framework |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |
| **TypeScript** | Type safety |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js Server Actions** | Server-side logic |
| **tRPC** | Type-safe APIs |
| **NextAuth** | Authentication |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database |
| **Neon** | Serverless PostgreSQL |

### AI / ML
| Technology | Purpose |
|------------|---------|
| **Python** | ML services |
| **Time-series models** | Price prediction |
| **Demand forecasting** | Market analysis |

### Real-Time Features
- WebSockets / Server-Sent Events for live bidding and price updates

### External Data Sources
- Government mandi price datasets
- Weather APIs for price-impact analysis

---

## 👥 Usability & Impact

### Target Users
- 👨‍🌾 **Farmers**
- 🏪 **Agricultural buyers** (retailers, wholesalers, exporters)

### User Interaction
| User | Actions |
|------|---------|
| **Farmers** | View live prices, predictions, and list produce |
| **Buyers** | Discover produce, bid in real-time, and negotiate directly |

### Real-World Impact
- ✅ **Increased farmer income** (20–40%)
- ✅ **Reduced dependency** on intermediaries
- ✅ **Faster market access**
- ✅ **Fair and transparent** agricultural trading ecosystem

---

## 🚀 Setup Instructions
### Prerequisites

- **Node.js** (v18+)
- **Python** (v3.9+)
- **PostgreSQL** / Neon account

### Installation

```bash
# Clone the repository
git clone https://github.com/Terkernel/AgroPulse.gitcd agropulse

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

### AI Service Setup

```bash
# Navigate to AI service folder
cd ai-service

# Install Python dependencies
pip install -r requirements.txt

# Run AI prediction service
python app.py
```

---

## 📁 Project Structure

```
agropulse/
├── prisma/              # Database schema
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── _components/ # React components
│   │   └── api/         # API routes
│   ├── server/          # Server-side code
│   │   ├── api/         # tRPC routers
│   │   └── auth/        # Authentication config
│   ├── styles/          # Global styles
│   └── trpc/            # tRPC client setup
└── ...
```

---

## 🔗 Links

| Resource | Link |
|----------|------|
| **Demo** | _To be added_ |
| **Presentation** | _To be added_ |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <strong>Team Trikernel</strong> | NMAMIT
</p>
