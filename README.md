# 🌿 Mosaic Wellness Journey — Product Journey Tracker

**Mosaic Wellness Journey** is a full-stack MERN (MongoDB, Express, React, Node.js) web application engineered with a **mobile-first** responsive design system. It enables customers who purchase wellness, skincare, haircare, and nutrition products to systematically track their personal experience, maintain daily check-in habits, capture optional progress photographs, complete weekly reflections, and visualize before/after transformations over time.

---

## 📱 Critical Responsive Mobile Design

This application is designed **exclusively for mobile phones**.
Regardless of whether a user opens it on:
- Large desktop monitors
- Laptops
- Tablets
- Smart TVs

The application **ALWAYS displays the mobile version**:
- **Desktop Viewport**: Centered 430px maximum width phone interface with realistic curved mobile bezels (`border-radius: 44px`), soft elevation shadows, simulated dynamic island/status bar, and calm nature-inspired ambient background outside the frame.
- **Mobile Viewport**: Fills 100% of the screen width seamlessly with fixed bottom navigation, safe-area inset support, and large touch-friendly action targets.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js (v18.3.1)
  - Vite (v6.4.5)
  - React Router DOM (v6)
  - Axios (with automated JWT interceptors)
  - Lucide React (feather-light modern icons)
  - Canvas Confetti (delightful milestone celebrations)
  - Typography: **Manrope** for headings & **DM Sans** for body text
- **Backend**:
  - Node.js (ES Modules)
  - Express.js REST API
  - JWT (JSON Web Tokens) with 30-day persistence
  - bcrypt.js for salted password hashing
  - Multer for 5 MB validated image file uploads
  - Cloudinary SDK + Local Secure Storage fallback
  - Express Rate Limit & Helmet-ready security headers
- **Database**:
  - MongoDB
  - Mongoose ODM (Indexes, ObjectId references, strict compound deduplication)
  - Zero-config embedded MongoDB engine (`mongodb-memory-server`) for instant execution without installing local daemons.

---

## 🎨 Design System & Colors

Inspired by premium wellness applications (e.g., Be Bodywise):
- **Primary Green**: `#456C53`
- **Primary Dark**: `#32503D`
- **Light Green**: `#E7EFE4`
- **Soft Background**: `#F8F9F5`
- **Pure White Cards**: `#FFFFFF`
- **Dark Typography**: `#1C3325`
- **Muted Text**: `#667085`
- **Accent Badges**: `#EA580C`, `#2563EB`, `#D97706`

---

## 📦 Project Structure

```
Mosaic/
│
├── client/                     # Vite + React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Header, BottomNav, PhotoCompareSlider
│   │   ├── context/            # AuthContext, JourneyContext
│   │   ├── layouts/            # MobileLayout (430px constraint & status bar)
│   │   ├── pages/              # Dashboard, Check-in, Reflections, Timeline, Photos, Admin
│   │   ├── services/           # Axios API client (endpoints & interceptors)
│   │   ├── App.jsx             # React Router setup & protected routes
│   │   ├── index.css           # Design tokens, phone frame & modern dialog styles
│   │   └── main.jsx
│   ├── index.html              # Viewport-fit & Google Fonts
│   ├── package.json
│   └── vite.config.js          # API proxy to backend
│
├── server/                     # Express REST API Backend
│   ├── config/                 # db.js (MongoDB Atlas & in-memory fallback)
│   ├── controllers/            # auth, products, journeys, checkins, photos, reflections, admin
│   ├── middleware/             # auth.js (JWT verify & adminOnly check)
│   ├── models/                 # User, Product, Journey, Checkin, ProgressPhoto, WeeklyReflection, Notification
│   ├── routes/                 # Express API routes
│   ├── services/               # uploadService.js, seed.js, testRunner.js
│   ├── uploads/                # Secure local storage directory
│   ├── .env                    # Configured environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express entrypoint with CORS & rate limiting
│
├── package.json                # Root convenience scripts
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher; v24 recommended)
- npm (v9 or higher)

### 2. Environment Variables Configuration
The backend comes pre-configured with a `.env` in `server/.env`:
```env
# MongoDB Connection String (MongoDB Atlas or Local MongoDB)
# Leave blank to automatically use zero-config embedded MongoDB fallback
MONGO_URI=

# Port for Backend Server
PORT=5000

# JSON Web Token Secret Key
JWT_SECRET=mosaic_wellness_jwt_secret_key_2026_super_secure

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Credentials for Cloud Image Storage
# If left blank, server automatically stores uploaded photos securely in local storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Connecting to MongoDB Atlas (Production Setup)
If you wish to connect your own MongoDB Atlas cluster:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create a Deployment** (choose the free M0 cluster).
3. Under **Security > Database Access**, create a user with read/write privileges (e.g. username `mosaic_admin` and password).
4. Under **Security > Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current IP.
5. In your Cluster Overview, click **Connect > Drivers > Node.js**.
6. Copy the connection string format:
   ```
   mongodb+srv://mosaic_admin:<password>@cluster0.abcde.mongodb.net/mosaic_wellness?retryWrites=true&w=majority
   ```
7. Paste this URI into `server/.env` under `MONGO_URI=`.

*Note: If `MONGO_URI` is left blank or cannot be reached, the server seamlessly initializes an embedded MongoDB engine (`mongodb-memory-server`), ensuring zero-friction local execution!*

### 4. Running the Application

In root directory:
```bash
# 1. Start Backend Server (runs on http://localhost:5000)
npm run server

# 2. In a second terminal, start Frontend Client (runs on http://localhost:5173)
npm run client
```

Or run directly from each directory:
- Server: `cd server && node server.js`
- Client: `cd client && npm run dev`

### 5. Running the Automated E2E Verification Suite
Run the 20-point test runner verifying all REST APIs, authentication, deduplication, photo uploads, and admin telemetry:
```bash
cd server
node services/testRunner.js
```

---

## 🔑 Demo Test Accounts

The seed script automatically populates the database with realistic wellness products, a demo customer journey, past check-ins, photos, reflections, and notifications.

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Demo Customer** | `customer@mosaicwellness.com` | `Customer@123` | Personal dashboard, streak, check-ins, photos, reflections |
| **Demo Admin** | `admin@mosaicwellness.com` | `Admin@123` | Admin telemetry, aggregate anonymized metrics |

*(You can also register any new customer account or click the one-click demo buttons on the login screen).*

---

## 🌟 Key Application Features

### 1. Customer Home Dashboard
- Personalized greeting (`"Hello, Aanya Sharma"`)
- Active Product Journey card (Product image, category badge, day counter e.g. Day 11 of 90, progress bar)
- Consecutive daily check-in streak counter (`🔥 10 Day Streak`)
- Daily check-in quick card with 5 emojis (😫 Very bad, 🙁 Bad, 😐 Okay, 🙂 Good, 🌟 Excellent)
- Monday–Sunday consistency calendar with check-in badges and weekly completion rate
- Journey statistics: Check-in count, reflections count, duration
- Progress milestone track (Day 1, 7, 14, 30, 60, 90)

### 2. Daily Check-in Module
- **Question 1**: How are you feeling today? (5 mood options with emojis)
- **Question 2**: How consistently did you use the product? (Used as directed, Used most days, Used occasionally, Did not use today)
- **Question 3**: What changes have you noticed? (Multiple selections: More energy, Better skin, Better hair, Better sleep, Feeling calmer, Improved confidence, No noticeable changes, Other)
- **Question 4**: Have you experienced any discomfort or unwanted effects? (None noticed, Mild, Moderate, Significant, Described in notes)
- **Question 5**: Additional notes (optional text area)
- **Question 6**: Optional Progress Photo upload:
  - Drag & drop or camera file picker
  - Supports JPG, PNG, WebP, HEIC up to 5 MB
  - Interactive photo preview with remove/replace buttons
  - Safe submission without photo (photos are strictly optional)
  - Duplicate prevention on same day with edit capability

### 3. Weekly Reflection Module
- Triggered every 7 days
- Questions:
  1. How has your experience changed this week? (Much better, A little better, No noticeable change, Worse, Not sure)
  2. What positive changes have you noticed?
  3. Have you faced any challenges?
  4. Have you experienced any unwanted effects?
  5. How likely are you to continue using this product? (Very likely, Likely, Not sure, Unlikely)
  6. Rate your overall experience from 1 to 10
- Saved in MongoDB with unique compound index per user, journey, and week.

### 4. Personal Journey Timeline
- Chronological timeline stream with date, mood badge, consistency, changes chips, notes, and photos
- Filtering by **Last 7 days**, **Last 30 days**, **Last 90 days**, or **All time**
- Interactive entry modal for inspecting complete details
- Delete entry capability.

### 5. Photo Comparison Feature
- Dedicated visual transformation gallery
- Grid of uploaded progress photos grouped by date
- Dual selector: choose any two photos as **Before** and **After**
- **Interactive Before/After Slider**: Drag handle across images with touch or mouse
- Side-by-side comparison view
- Photo deletion option
- Ethical disclaimer banner: Visual tracking only; does not generate medical diagnoses or claims.

### 6. Product Journey Management
- Switch between multiple active product journeys (e.g. Hair Growth Serum vs Vitamin C Serum)
- Start a new product journey with custom start date, target duration, and personal goal
- Pause, resume, or mark journeys as completed
- Scoped data isolation: All check-ins and photos belong strictly to their selected journey.

### 7. Notification System
- Daily check-in habit reminders
- Weekly reflection prompts
- Milestone unlocked celebrations (Day 7, 14, 30, 60, 90)
- Browser notification permission request
- Unread badge counter and mark all as read.

### 8. Customer Profile & Privacy Rights
- Name, email, phone number, member since
- Toggles for daily prompts, reflections, and milestone alerts
- **Export Data**: Download complete personal journey history as a structured JSON file
- **Right to be Forgotten**: One-click account & data deletion purging all photos, check-ins, and records.

### 9. Admin Dashboard (Aggregated Telemetry)
- Protected by `role: 'admin'` check
- Aggregated customer counts and active journeys
- Aggregate mood distribution breakdown
- Tolerability and reported discomfort analytics
- Journeys grouped by product category
- **Strict Privacy Principle**: Administrators are never exposed to private customer photos or personal journal entries.

---

## 🔒 Security & Best Practices

1. Passwords hashed using `bcryptjs` with salt rounds.
2. Tokens signed with `jsonwebtoken` and verified via middleware.
3. Private file storage with authenticated delivery: photos can only be retrieved by their owner.
4. Input validation and file-type whitelist on Multer uploads.
5. Rate limiting with `express-rate-limit` prevents brute-force requests.
6. CORS configured with credentials support.
7. Fully accessible semantic HTML, native dialog handling, and overscroll containment.

---

## 📄 License
ISC License © 2026 Mosaic Wellness. Built with precision for premium mobile wellness tracking.
