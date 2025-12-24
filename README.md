# Pothole Reporting WebApp - Frontend

A Next.js-based frontend for the Pothole Reporting system.

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Environment Variables

Create a `.env.local` file if you need to configure the backend API endpoint:

```env
NEXT_PUBLIC_API_URL=http://localhost:3005
```

## Features

- **Home Page**: View and explore pothole reports
- **Report Page**: Submit new pothole reports with location selection on a map
- **Admin Dashboard**: View, manage, and update pothole statuses
- **Authentication**: Secure admin login with token-based authentication
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Map Integration**: Leaflet-based interactive maps for location selection

## Components

- `Layout.jsx`: Main layout component with navigation
- `Map.jsx`: Interactive map component using Leaflet
- `ReportForm.jsx`: Form for submitting new pothole reports
- `PotholeList.jsx`: Display list of reported potholes
- `AdminDashboard.jsx`: Admin dashboard for managing reports

## Project Structure

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

## API Integration

The frontend communicates with a backend API at `http://localhost:3005` for:
- Fetching pothole reports
- Submitting new reports
- Admin authentication
- Updating pothole status
- Deleting reports

## Notes

- Authentication tokens are stored in localStorage
- The app uses Next.js file-based routing
- Global styles are managed via Tailwind CSS in `src/styles/global.css`
- Context API is used for app-wide state management (potholeCount, admin status, etc.)
