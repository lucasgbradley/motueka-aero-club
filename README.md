# Motueka Aero Club — Flight Operations, Bookings & Invoicing

A modern flight operations and club management portal for **Motueka Aero Club** ([NZMK](https://en.wikipedia.org/wiki/Motueka_Aerodrome)), built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase** (`motueka-aero`).

---

## Features

- **Live Fleet Radar & ADS-B Tracking**: Real-time integration with Flightradar24 / OpenSky Network APIs to monitor if club aircraft (e.g. `ZK-TMC`, `ZK-MBX`, `ZK-FOW`) are airborne or on the ground at NZMK, complete with transponder squawk codes (e.g. `1200`, `7000`), barometric altitude, and ground speed.
- **Aircraft Flight Bookings**: Schedule dual training, solo flights, private hire, and maintenance test flights.
- **Invoicing & Xero Accounting Sync**: Automated flight hire fee calculations based on Hobbs flight hours and landing fees, with 1-click sync to Xero Accounting.
- **Member Applications & Annual Subscriptions**: Online application workflow for Full Flying, Student Pilot, and Associate members, with automated Xero billing.
- **Executive Operations & Financial Reporting**: Monthly flight hours, aircraft fleet utilization, and accounting synchronization status.
- **Firebase Authentication**: Email/Password and Google Sign-in.
- **Cloud Firestore Backend**: Strict security rules with role-based access control (admin, pilot, member).

---

## Firebase Configuration

Connected to Firebase Project: **`motueka-aero`**  
Web App ID: `1:193902400352:web:42f52e16da959f52164405`

### Enabled Authentication Providers:
- Email / Password
- Google Sign-In (OAuth brand: Motueka Aero Club, support: `l.bradley@laserelectrical.co.nz`)

---

## Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Deploy Security Rules & Auth:**
   ```bash
   npx -y firebase-tools@latest deploy --only auth,firestore:rules
   ```

---

## Cloud Firestore Initialization Note

If Cloud Firestore has not been enabled in the Google Cloud / Firebase console yet for `motueka-aero`:
1. Visit the [Firebase Console Firestore Database](https://console.firebase.google.com/project/motueka-aero/firestore).
2. Click **Create database**.
3. Choose location (recommended: `australia-southeast1` Sydney for lowest latency in New Zealand).
4. Run `npx -y firebase-tools@latest deploy --only firestore:rules` to publish the security rules.
