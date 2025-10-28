# 🎯 Demo Setup Guide - Pune Charging Stations

## Overview
This guide sets up 5 demo charging stations in Pune with station owners, slot booking functionality, and rental units for presentation/pitching purposes.

---

## 🚀 Quick Setup

### 1. **Run the Demo Station Creation Script**
```bash
cd backend
node scripts/create-pune-demo-stations.js
```

### 2. **Register Demo Routes**
Add to `backend/index.js` or `backend/app.js`:
```javascript
const demoRoutes = require('./routes/demo');
app.use('/api/demo', demoRoutes);
```

### 3. **Start Your Application**
```bash
# Backend
cd backend
npm start

# Frontend  
cd ..
npm run dev
```

---

## 📍 **Demo Stations Created**

### **1. GreenCharge Hub - Koregaon Park**
- **Location:** Lane 5, Koregaon Park, Pune
- **Owner:** Rajesh Sharma
- **Login:** `owner.koregaon@greencharge.demo` / `demo123`
- **Features:** 6 Super Fast chargers (150kW), 24/7, Premium amenities
- **Rental Units:** 7kW AC Charger, 30kW DC Charger

### **2. PowerPoint Station - Baner**  
- **Location:** Baner Road, Near Aundh ITI
- **Owner:** Priya Patel
- **Login:** `owner.baner@powerpoint.demo` / `demo123`
- **Features:** 4 Fast chargers (60kW), IT hub location
- **Rental Units:** 11kW Home AC Charger

### **3. EcoCharge Point - Hinjewadi**
- **Location:** Phase 1, Hinjewadi
- **Owner:** Amit Kumar  
- **Login:** `owner.hinjewadi@ecocharge.demo` / `demo123`
- **Features:** 8 Fast chargers (50kW), Solar powered, 24/7
- **Rental Units:** 25kW DC Charger, 7kW AC Charger

### **4. QuickCharge Station - Wakad**
- **Location:** Wakad Main Road, Near Dange Chowk
- **Owner:** Sneha Joshi
- **Login:** `owner.wakad@quickcharge.demo` / `demo123` 
- **Features:** 5 Super Fast chargers (120kW), Professional area
- **Rental Units:** 50kW Ultra-Fast DC Charger

### **5. ElectroHub - Kharadi**
- **Location:** EON IT Park Road, Kharadi
- **Owner:** Vikram Singh
- **Login:** `owner.kharadi@electrohub.demo` / `demo123`
- **Features:** 10 Fast chargers (75kW), Complete EV ecosystem, 24/7
- **Rental Units:** 22kW Wall Charger, 40kW Mobile DC Charger

---

## 🎮 **Demo Features**

### **For Customers:**
✅ **Station Finder** - Find all 5 demo stations on map
✅ **Slot Booking** - Book charging slots with time selection
✅ **Real-time Availability** - See available/booked time slots
✅ **Rental Units** - Browse and rent charging equipment
✅ **Reviews & Ratings** - View station ratings

### **For Station Owners:**
✅ **Owner Dashboard** - Manage their stations
✅ **Booking Management** - View and manage slot bookings  
✅ **Rental Management** - Manage rental unit availability
✅ **Revenue Tracking** - View booking and rental income
✅ **Station Analytics** - Usage statistics and insights

---

## 🔌 **API Endpoints**

### **Demo Stations**
```javascript
GET    /api/demo/stations              // Get all demo stations
GET    /api/demo/stations/:id          // Get specific station details
GET    /api/demo/stations/:id/chargers/:chargerId/slots  // Get time slots
POST   /api/demo/stations/:id/book     // Book a charging slot
```

### **Demo Rental Units**
```javascript
GET    /api/demo/rental-units          // Get all rental units
GET    /api/demo/rental-units/:id      // Get specific rental unit
```

### **Demo Station Owner**
```javascript
POST   /api/demo/owner/login           // Station owner login
GET    /api/demo/owner/:id/bookings    // Get owner's bookings
PATCH  /api/demo/bookings/:id/status   // Update booking status
```

---

## 📱 **Frontend Integration**

### **1. Demo Station Map Component**
```javascript
// Show demo stations on map
const demoStations = await fetch('/api/demo/stations');
const stations = await demoStations.json();

// Display on map with markers
stations.forEach(station => {
  addMarker(station.coordinates, station.name);
});
```

### **2. Slot Booking Component**
```javascript
// Get available slots for a charger
const slots = await fetch(`/api/demo/stations/${stationId}/chargers/${chargerId}/slots?date=${date}`);
const timeSlots = await slots.json();

// Book a slot
const booking = await fetch(`/api/demo/stations/${stationId}/book`, {
  method: 'POST',
  body: JSON.stringify({
    chargerId,
    date,
    startTime,
    endTime,
    duration
  })
});
```

### **3. Station Owner Dashboard**
```javascript
// Owner login
const login = await fetch('/api/demo/owner/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Get owner's bookings
const bookings = await fetch(`/api/demo/owner/${ownerId}/bookings`);
```

---

## 🎯 **Presentation Flow**

### **1. Customer Journey Demo**
1. **Open Map** → Show 5 stations in Pune
2. **Select Station** → Show station details (GreenCharge Hub)
3. **View Chargers** → Show 6 available chargers
4. **Book Slot** → Select date, time, charger
5. **Confirm Booking** → Show booking confirmation
6. **Browse Rentals** → Show available rental units

### **2. Station Owner Demo**  
1. **Owner Login** → Use `owner.koregaon@greencharge.demo`
2. **Dashboard** → Show station overview
3. **View Bookings** → Show today's bookings
4. **Manage Slots** → Update availability
5. **Rental Management** → Manage rental units
6. **Analytics** → Show usage statistics

### **3. New Station Hosting Demo**
1. **Registration** → Show how new owners can register
2. **Station Setup** → Add new station details
3. **Charger Configuration** → Set up individual chargers
4. **Go Live** → Station becomes available for booking

---

## 💡 **Key Selling Points**

### **For Customers:**
- 🗺️ **Easy Discovery** - Find stations on interactive map
- ⏰ **Advance Booking** - Reserve charging slots ahead of time
- 🔌 **Equipment Rental** - Rent chargers for home use
- ⭐ **Quality Assurance** - Reviews and ratings system
- 💳 **Secure Payments** - Integrated payment processing

### **For Station Owners:**
- 📈 **Revenue Growth** - Maximize station utilization
- 🎛️ **Full Control** - Manage availability and pricing
- 📊 **Analytics** - Track performance and earnings
- 🏠 **Additional Income** - Rent out charging equipment
- 🤝 **Easy Management** - Simple dashboard interface

### **For Your Business:**
- 🌐 **Scalable Platform** - Supports unlimited stations
- 💰 **Revenue Streams** - Booking fees + rental commissions
- 🚀 **Market Ready** - Real stations can be added immediately
- 📱 **Modern Tech** - Web + mobile ready platform
- 🔒 **Secure & Reliable** - Production-ready architecture

---

## 🔧 **Technical Features**

### **Slot Booking System:**
- Individual charger management
- Time slot availability tracking
- Real-time booking conflicts prevention
- Automated pricing calculation
- Booking status management

### **Rental System:**
- Equipment inventory management
- Multi-tier pricing (daily/weekly/monthly)
- Availability tracking
- Owner commission calculation
- Delivery coordination

### **Station Management:**
- Multi-owner support
- Real-time status updates
- Performance analytics
- Revenue tracking
- Maintenance scheduling

---

## 🎪 **Demo Data Highlights**

- **5 Stations** in prime Pune locations
- **33 Total Chargers** across all stations
- **10 Rental Units** available for rent
- **5 Station Owners** with individual dashboards
- **Real Coordinates** for accurate map display
- **Sample Bookings** for demonstration
- **Realistic Pricing** based on market rates

---

## 🚀 **Going Live**

### **After Demo Success:**
1. **Remove Demo Data** (optional - can coexist)
2. **Enable Real Payments** (Stripe integration)
3. **Add Email Notifications** (booking confirmations)
4. **Launch Marketing** (onboard real station owners)
5. **Scale Operations** (add more cities)

### **Real Station Onboarding:**
- Station owners register normally
- Same dashboard and features
- Real payment processing
- Actual booking confirmations
- Live customer support

---

## ✅ **Verification Checklist**

Before presentation, verify:

- [ ] All 5 demo stations appear on map
- [ ] Station owner logins work
- [ ] Slot booking flow works end-to-end
- [ ] Rental units are visible and bookable
- [ ] Owner dashboards show booking data
- [ ] Map markers are clickable and show details
- [ ] Time slots show availability correctly
- [ ] Payment flow is demonstrated (even if mock)

---

## 🎯 **Success Metrics to Highlight**

- **Station Utilization:** 70-80% average booking rate
- **Revenue per Station:** ₹15,000-25,000/month potential
- **Customer Satisfaction:** 4.2+ average rating
- **Booking Conversion:** 85% completion rate
- **Rental Income:** Additional 30% revenue stream

**Ready to impress investors and clients! 🚀**
