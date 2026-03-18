# ⚽ Player Ratings

A FIFA-inspired player rating and management platform built for football academies and coaching staff. Track, evaluate, and showcase learner development with interactive player cards, radar charts, match tracking, formation building, scouting tools, and much more.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel&logoColor=white)

---

## 🎯 Overview

Player Ratings provides a dual-view system — a **public-facing portal** for parents and learners to explore player profiles, fixtures, and news, and a **protected admin panel** for coaches to manage every aspect of their squad. All data syncs in real-time via Firebase Firestore.

### Public Portal
> `yoursite.vercel.app`

Accessible to anyone — browse player cards, compare players head-to-head, view upcoming and past fixtures, read club news, and submit self-assessments.

### Admin Panel
> `yoursite.vercel.app/login`

Role-based access for coaches. Head Coaches have full control; Assistant Coaches can edit ratings but cannot delete players or manage staff.

---

## ✨ Features

### 🃏 Player Cards & Profiles
- FIFA-style cards with overall rating badge, color-coded by tier
- Interactive radar/spider chart showing 6 category scores
- Position badges, jersey number, and team assignment display
- Hover animations and click-to-expand full detail modal
- Detail modal includes: large radar chart, mini pitch map, full attribute breakdown with progress bars, position rating comparisons, match stats, attendance history, training notes, self-assessment comparison, and award history

### 📊 Rating System
Ratings are calculated from **19 outfield attributes** grouped into 6 categories:

| Category | Label | Derived From |
|----------|-------|-------------|
| Technical | TEC | First Touch, Dribbling, Ball Protection, Balance |
| Passing | PAS | Passing Accuracy, First Touch, Decision Making |
| Attacking | ATT | Shooting Technique, Weak Foot, Positioning |
| Physical | PHY | Speed, Agility, Strength, Stamina |
| Defense | DEF | Tackling, Ball Protection, Strength |
| Mentality | MENT | Decision Making, Communication, Work Rate, Coachability, Discipline, Leadership Potential |

The **Overall Rating** shown on each card is the **best position-weighted rating** across all assigned positions — a CB isn't penalized for low attacking stats.

### 🥅 Goalkeeping Module
- 5 GK-specific attributes: Diving, Handling, Kicking, Reflexes, GK Positioning
- GK sliders only appear when the GK position is selected
- GK position rating weights goalkeeping at 50%
- Players can be dual-role (e.g., ST + GK) with independent ratings for each

### 🔢 Position-Weighted Ratings

| Category | ST | CB | GK |
|----------|-----|-----|-----|
| Technical | 17% | 8% | 4% |
| Passing | 10% | 10% | 4% |
| Attacking | 33% | 2% | 2% |
| Physical | 20% | 22% | 16% |
| Defense | 2% | 33% | 10% |
| Mentality | 18% | 25% | 14% |
| Goalkeeping | — | — | 50% |

Full weight tables exist for all 15 positions: GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, CF, ST.

### 🏟️ Formation Builder
- 8 formations available: 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 4-1-4-1, 3-4-3, 5-3-2, 4-3-2-1
- Visual pitch with drag-and-drop player assignment to slots
- Each player shows their **position-specific rating** once placed
- **Auto-Fill Best XI** — automatically picks the highest-rated player for each slot
- Team average rating displayed as players are filled in
- Filter player pool by team; clear all and start fresh

### ⚽ Match Centre
- Create and manage fixtures (home/away, date, opponent, venue)
- Live match detail page for recording player performance stats
- Per-player stat tracking: goals, assists, yellow/red cards, rating, played/subbed
- Match results and stats feed into player detail profiles
- Head coach can delete matches; all associated stats are cleaned up automatically

### 📋 Attendance & Training
- Session-based attendance tracking (Present / Late / Absent / Excused)
- Attendance history visible per player in their detail modal
- Training detail page with per-session notes for each player
- Notes are stored per-session and accessible from player profiles

### 🧑‍🤝‍🧑 Multi-Team Support
- Create and manage multiple age-group teams (e.g., U10, U12, U15)
- Players can belong to multiple teams simultaneously
- Age-based team suggestion when adding new players
- Filter players, formations, and scouting by team

### 📝 Assessment System
- Coaches can open and close named assessment periods (e.g., "Term 1", "Pre-season")
- When an assessment is active, every rating save creates a historical snapshot
- Snapshot history is used to power the **Biggest Improvers** leaderboard
- Leaderboard shows improvement deltas and is visible on the admin dashboard

### 🔍 Scouting (Trial Players)
- Add trial players with the same full attribute slider system as regular players
- Record trial date, source/referral, parent contact, positions, and scout notes
- Set a verdict: Pending / Sign / Reject / Callback
- **Convert to Squad** — one-click promotion from trial to full player profile
- Filter trials by Active / Signed / Rejected
- Signed trials are archived with a converted timestamp

### 🏆 Awards
- Give awards to players with preset templates or fully custom emoji + label
- Templates include: Most Improved, Player of the Term, Golden Boot, Golden Glove, Rising Star, and more
- Optional reason field for each award
- Awards appear in the player's detail modal
- Top awarded players leaderboard on the awards page

### 🆚 Player Comparison
- Side-by-side comparison of any two players
- Radar chart overlay, category scores, and full attribute breakdown
- Best position ratings shown for both players

### 📰 Club News
- Coaches can publish, edit, and delete news posts
- Public news detail pages with full content
- Feed visible on the public homepage

### 📅 Fixtures (Public)
- Public fixtures page listing upcoming and completed matches
- Separate upcoming/results tabs with opponent, venue, date, and score

### 🪞 Self-Assessment
- Players can submit self-assessments using an access code
- Ratings submitted via self-assessment are stored separately
- Coaches can compare coach ratings vs player self-assessment in the detail modal

### 👤 Coach Profiles & Staff Management
- Each coach has a profile with name, avatar (emoji or initial), and color
- Head Coaches can invite assistant coaches via email
- Head Coaches can manage roles, update staff details, and remove coaches
- Profile modal accessible from the admin dashboard top bar

### 🏠 Club Settings
- Set club name, motto, about text, primary color, and logo emoji
- Club name propagates across all pages (admin header, scouting title, awards title, etc.)
- Head Coach only access

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6 |
| Routing | React Router DOM |
| Database | Firebase Firestore (real-time subscriptions) |
| Auth | Firebase Authentication (Email + Google SSO) |
| Hosting | Vercel |
| Styling | Inline styles (no CSS framework) |

---

## 🔐 Role System

| Permission | Head Coach | Assistant Coach |
|------------|-----------|-----------------|
| View & edit player ratings | ✅ | ✅ |
| Add players | ✅ | ✅ |
| Delete players | ✅ | ❌ |
| Manage teams & formations | ✅ | ❌ |
| Invite / remove coaches | ✅ | ❌ |
| Club settings | ✅ | ❌ |
| Open / close assessments | ✅ | ✅ |
| Give awards | ✅ | ✅ |
| Manage matches | ✅ | ✅ |
| Scouting / trials | ✅ | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore and Authentication enabled
- A Vercel account (for deployment)

### Installation

```bash
git clone https://github.com/ngareroy/player-ratings.git
cd player-ratings
npm install
```

### Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** in test mode
3. Enable **Authentication** — turn on Email/Password and Google providers
4. Update `src/firebase.js` with your config:

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

5. Create your first admin by running `importPlayers.mjs` or manually adding a document to the `admins` Firestore collection with `role: "head_coach"`.

### Development

```bash
npm run dev
```

- Public portal: `http://localhost:5173`
- Admin panel: `http://localhost:5173/login`

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
│   ├── CoachProfileModal.jsx      # Coach profile editor
│   ├── ImproversLeaderboard.jsx   # Biggest improvers widget
│   ├── InviteCoachModal.jsx       # Staff invite modal
│   ├── MiniPitch.jsx              # Pitch position map
│   ├── Modal.jsx                  # Player add/edit modal
│   ├── PlayerAttendance.jsx       # Per-player attendance view
│   ├── PlayerAwards.jsx           # Per-player awards list
│   ├── PlayerCard.jsx             # Player card with radar chart
│   ├── PlayerDetailModal.jsx      # Full player detail view
│   ├── PlayerMatchStats.jsx       # Per-player match stats
│   ├── PlayerTrainingNotes.jsx    # Per-player training notes
│   ├── ProgressChart.jsx          # Rating history line chart
│   ├── RadarChart.jsx             # SVG radar/spider chart
│   ├── ReportButton.jsx           # PDF report generator
│   └── SelfAssessCompare.jsx      # Coach vs self-assessment comparison
├── contexts/
│   └── AuthContext.jsx            # Auth state, role helpers
├── pages/
│   ├── AdminView.jsx              # Main admin dashboard
│   ├── AssessmentManager.jsx      # Assessment period management
│   ├── AttendancePage.jsx         # Session attendance tracker
│   ├── AwardsPage.jsx             # Awards management
│   ├── ClubSettings.jsx           # Club branding settings
│   ├── ComparePlayers.jsx         # Side-by-side player comparison
│   ├── FormationBuilder.jsx       # Drag-and-drop formation tool
│   ├── HomePage.jsx               # Public club homepage
│   ├── LoginPage.jsx              # Coach login (email + Google)
│   ├── ManageTeam.jsx             # Staff & invite management
│   ├── MatchCenter.jsx            # Fixtures list & creation
│   ├── MatchDetail.jsx            # Live match stats entry
│   ├── NewsDetail.jsx             # Public news article view
│   ├── PublicFixtures.jsx         # Public fixtures & results
│   ├── PublicView.jsx             # Public player gallery
│   ├── ScoutingPage.jsx           # Trial player management
│   ├── SelfAssessPage.jsx         # Player self-assessment portal
│   ├── TeamManager.jsx            # Age-group team management
│   └── TrainingDetail.jsx         # Session training notes
├── utils/
│   └── generateReport.js          # PDF report generation
├── App.jsx                        # Route definitions
├── firebase.js                    # Firebase config & all Firestore ops
├── main.jsx                       # App entry point
├── utils.js                       # Rating formulas, constants, helpers
└── global.css                     # Global base styles
```

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

## 📄 License

This project is private and maintained by [@ngareroy](https://github.com/ngareroy).
