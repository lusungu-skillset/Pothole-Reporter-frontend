
# Porthole Reporting WebApp - Frontend

A modern Next.js-based frontend for the Pothole Reporting system, featuring a robust admin dashboard, real-time reporting, and interactive analytics.

---

## 🚀 Quick Start

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Install & Run:**
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

**Production Build:**
```bash
npm run build
npm start
```

**Environment:**
Create `.env.local` if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:3005
```

---

## 🏗️ Architecture (Summary)

- **Next.js** for SSR, routing, and static generation
- **React Context API** for global state (user, admin, reports)
- **Tailwind CSS** for responsive, mobile-first UI
- **Leaflet** for map integration
- **Modular Components**: Each feature is encapsulated in its own component for maintainability
- **API Layer**: All data interactions go through a centralized API utility

---

## ✨ Key Features

- **User Reporting**: Submit pothole reports with geolocation and images
- **Admin Dashboard**: View, filter, and update report statuses
- **Analytics**: Visualize pothole data (counts, locations, status breakdown)
- **Authentication**: Secure admin login (token-based)
- **Mobile Responsive**: Optimized for all devices
- **Real-time Updates**: Reports and status changes reflect instantly

---

## 🛠️ Main Components

- `Layout.jsx`: App shell, navigation, and context
- `Map.jsx`: Interactive map for selecting/reporting potholes
- `ReportForm.jsx`: User form for new reports
- `PotholeList.jsx`: List and filter pothole reports
- `PotholeDetailsModal.jsx`: Detailed view for each report
- `DashboardStats.jsx` & `Analytics.jsx`: Admin analytics and stats
- `ProtectedRoute.jsx`: Route protection for admin pages

---

## 📊 Admin Dashboard Overview

- **Dashboard Home**: Quick stats, recent reports, and analytics
- **Report Management**: View, filter, update, and delete reports
- **Status Tracking**: Change pothole status (e.g., Reported, In Progress, Resolved)
- **Analytics**: Charts for pothole trends, locations, and status
- **User Management**: Secure login/logout, session handling

---

## 🔄 API Integration

All data is fetched from the backend API (`NEXT_PUBLIC_API_URL`).

- **Endpoints:**
	- `GET /reports` - List all pothole reports
	- `POST /reports` - Submit a new report
	- `POST /auth/login` - Admin login
	- `PATCH /reports/:id` - Update report status
	- `DELETE /reports/:id` - Remove a report

Tokens are stored in `localStorage` for admin sessions.

---

## 📁 Project Structure

```
frontend/
├── pages/                 # Next.js pages and routing
│   ├── _app.jsx          # App wrapper with context provider
│   ├── index.jsx         # Home page
│   ├── report.jsx        # Report page
│   ├── admin.jsx         # Admin dashboard page
│   └── login.jsx         # Login page
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components (content)
│   ├── context/         # React context for app state
│   └── styles/          # Global stylesheets
├── public/              # Static assets
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

---

## 📝 Notes & Best Practices

- Use the admin dashboard for all report management and analytics
- All API changes and updates are documented in the backend repo
- For custom API endpoints or new features, update the API utility and context accordingly
- Keep authentication tokens secure; never expose them in client code
- For UI changes, update Tailwind classes in `src/styles/global.css`

---

## 📚 Further Reading

- For detailed admin dashboard features, see the original documentation files (now merged here)
- For API changes, refer to backend API docs

More on the aips and its operations are specified in the IMPLEMENTATION_FILES.MD folder

---

**Contributions welcome!**
