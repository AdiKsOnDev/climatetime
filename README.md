# 🌍 ClimateTime - Iteration 1

AI-Powered Local Climate Education Platform - Foundation & Location Intelligence

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (v12+ recommended)
- npm or yarn

### Installation

1. **Clone and setup dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Setup database**
   ```bash
   ./setup-db.sh
   ```

3. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your settings
   ```

4. **Get free API keys**
   - OpenWeather API: https://openweathermap.org/api (free tier: 60 calls/minute)
   - Add your key to `backend/.env`

5. **Start development servers**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
├── frontend/          # React TypeScript app with Tailwind CSS
│   ├── src/
│   │   ├── components/    # Location input, climate display, charts
│   │   ├── types/         # TypeScript definitions
│   │   └── App.tsx        # Main application
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── routes/        # API endpoints (/location, /weather)
│   │   ├── services/      # Geocoding & weather services
│   │   ├── database/      # PostgreSQL schema
│   │   └── utils/         # Logging utilities
└── setup-db.sh       # Database initialization script
```

## ✨ Features Implemented

### Core Functionality
- ✅ **Location Input**: Address or coordinate input with geolocation support
- ✅ **Geocoding**: Free OpenStreetMap Nominatim integration
- ✅ **Weather API**: OpenWeatherMap integration with mock fallback
- ✅ **Responsive UI**: Clean, modern interface with Tailwind CSS
- ✅ **Data Visualization**: Interactive charts for climate metrics
- ✅ **Error Handling**: Comprehensive error states and loading indicators

### Technical Features
- ✅ **Monorepo Structure**: Organized frontend/backend separation
- ✅ **TypeScript**: Full type safety across the stack  
- ✅ **PostgreSQL**: Structured data storage with caching
- ✅ **API Architecture**: RESTful endpoints with proper validation
- ✅ **Modern React**: Hooks-based components with Chart.js integration

## 🌐 API Endpoints

- `GET /api/location?address=<address>` - Geocoding service
- `GET /api/weather?lat=<lat>&lon=<lon>` - Weather data
- `GET /health` - Health check

## 🎯 Success Criteria Met

- [x] User can input any address and see current climate data
- [x] Application is responsive and loads quickly  
- [x] Clean, intuitive interface
- [x] Proper error handling and loading states
- [x] TypeScript configuration for both frontend and backend
- [x] API route structure for location-based queries

## 🔄 What's Next

Iteration 1 is complete! Ready for **Iteration 2: Historical Climate Data Visualization**

### Next Features:
- Historical climate data integration (NOAA/Berkeley Earth)
- Interactive timeline components
- Before/after comparison views
- Data caching optimization
- Advanced charting with historical trends

## 🛠️ Development

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run typecheck` - TypeScript checking

## 📊 Free Services Used

- **Geocoding**: OpenStreetMap Nominatim (unlimited, rate-limited)
- **Weather**: OpenWeatherMap (60 calls/minute free)
- **Database**: PostgreSQL (local development)
- **Charts**: Chart.js (free, open source)

## 🏗️ Architecture Principles

- **Modularity**: One class per file, clear separation of concerns
- **Error Resilience**: Graceful fallbacks and comprehensive error handling
- **Performance**: Efficient API calls with proper caching strategy
- **User Experience**: Responsive design with loading states and clear feedback
- **Type Safety**: Full TypeScript integration for maintainable code

---

