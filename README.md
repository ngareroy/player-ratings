# ⚽ Player Ratings

A FIFA-inspired player rating and management system built for football academies and coaching staff. Track, evaluate, and showcase learner development with beautiful interactive player cards, radar charts, and position-weighted ratings.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel&logoColor=white)

---

## 🎯 Overview

Player Ratings provides a dual-view system — a **public view** for parents and learners to browse player profiles, and a **secret admin panel** for coaches to manage ratings, positions, and player data. All changes sync in real-time via Firebase.

### Public View
> `yoursite.vercel.app`

Parents and learners can browse player cards, sort by category, search by name, and click any card to view a detailed player profile.

### Admin Panel
> `yoursite.vercel.app/admin/your-secret-key`

Coaches can add, edit, and delete players, adjust all 19+ attributes via sliders, assign positions, and set jersey numbers.

---

## ✨ Features

### Player Cards
- FIFA-style cards with overall rating badge, color-coded by tier (green → red)
- Interactive radar/spider chart showing 6 category scores
- Position badges and jersey number display
- Hover animations and click-to-expand detail view

### Position-Weighted Ratings
- Each position (GK, CB, ST, CAM, etc.) has custom category weights
- A CB's rating emphasizes defense (33%) and physicality (22%) while de-emphasizing attacking (2%)
- A ST's rating weighs attacking at 33% and technical ability at 17%
- Players can hold multiple positions with independent ratings for each

### Smart Category System
Ratings are auto-calculated from 19 base attributes grouped into 6 categories:

| Category | Label | Derived From |
|----------|-------|-------------|
| Technical | TEC | First Touch, Dribbling, Ball Protection, Balance |
| Passing | PAS | Passing Accuracy, First Touch, Decision Making |
| Attacking | ATT | Shooting Technique, Weak Foot, Positioning |
| Physical | PHY | Speed, Agility, Strength, Stamina |
| Defense | DEF | Tackling, Ball Protection, Strength |
| Mentality | MENT | Decision Making, Communication, Work Rate, Coachability, Discipline, Leadership Potential |

### Goalkeeping Module
- 5 additional GK-specific attributes: Diving, Handling, Kicking, Reflexes, GK Positioning
- GK sliders are greyed out and locked until the GK position is assigned
- GK position rating weighs goalkeeping attributes at 50%
- Players can be dual-role (e.g., ST + GK) with separate ratings for each

### Player Detail Modal
- Full-screen splash view when clicking any player card
- Large radar chart with all 6 category breakdowns
- Mini pitch map showing active positions with rating-colored markers
- Complete attribute list with progress bars organized by category
- Position rating comparison

### Mini Pitch Map
- Football Manager-inspired pitch visualization
- Shows all standard positions as markers on a top-down pitch
- Active positions light up with rating-based colors (green/yellow/orange/red)
- GK position uses distinct amber color scheme
- Pitch legend with per-position ratings

### Jersey Number Management
- Single jersey number for outfield-only or GK-only players
- Dual jersey numbers when a player plays both GK and outfield
- Validation prevents duplicate jersey numbers across the squad

### Admin Features
- Add new learners with all attributes via slider interface
- Edit existing player ratings with live preview of category scores
- Delete players with confirmation
- Multi-position selection grouped by GK / DEF / MID / ATT
- Real-time position rating preview while editing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6 |
| Routing | React Router DOM |
| Database | Firebase Firestore (real-time sync) |
| Hosting | Vercel |
| Styling | Inline styles (no CSS framework) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore enabled
- A Vercel account (for deployment)

### Installation

```bash
git clone https://github.com/ngareroy/player-ratings.git
cd player-ratings
npm install
```

### Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore in test mode
3. Update `src/firebase.js` with your Firebase config:

```js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

4. Set your admin secret key in the same file:

```js
export const ADMIN_SECRET = 'your-secret-key'
```

### Development

```bash
npm run dev
```

- Public view: `http://localhost:5173`
- Admin panel: `http://localhost:5173/admin/your-secret-key`

### Deployment

Push to GitHub and connect to Vercel — it auto-deploys on every push.

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── MiniPitch.jsx          # Pitch position map
│   ├── Modal.jsx              # Admin add/edit modal
│   ├── PlayerCard.jsx         # Player card with radar chart
│   ├── PlayerDetailModal.jsx  # Full player detail view
│   └── RadarChart.jsx         # SVG radar/spider chart
├── pages/
│   ├── AdminView.jsx          # Coach admin panel
│   └── PublicView.jsx         # Public player gallery
├── App.jsx                    # Route definitions
├── firebase.js                # Firebase config & CRUD operations
├── main.jsx                   # App entry point
└── utils.js                   # Rating formulas, constants, helpers
```

---

## 📊 Rating System

### Overall Rating
The overall rating displayed on each card is the **best position-weighted rating** across all assigned positions. This means a defender isn't penalized for low attacking stats — their rating reflects how good they are at their actual position.

### Position Weights Example

| Category | ST | CB | GK |
|----------|-----|-----|-----|
| Technical | 17% | 8% | 4% |
| Passing | 10% | 10% | 4% |
| Attacking | 33% | 2% | 2% |
| Physical | 20% | 22% | 16% |
| Defense | 2% | 33% | 10% |
| Mentality | 18% | 25% | 14% |
| Goalkeeping | — | — | 50% |

---

## 🎨 Color Rating Scale

| Range | Color | Tier |
|-------|-------|------|
| 80–99 | 🟢 Green | Excellent |
| 70–79 | 🟢 Light Green | Good |
| 60–69 | 🟡 Yellow | Average |
| 50–59 | 🟠 Orange | Below Average |
| 0–49 | 🔴 Red | Poor |

---

## 🗺️ Roadmap

- [ ] Club homepage with team info and branding
- [ ] Player photo uploads
- [ ] Historical rating tracking and progress charts
- [ ] Team formation builder
- [ ] Match day squad selection
- [ ] PDF report exports
- [ ] Multi-team support

---

## 📄 License

This project is private and maintained by [@ngareroy](https://github.com/ngareroy).