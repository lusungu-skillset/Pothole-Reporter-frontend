# Admin Dashboard - Component Architecture

## 🏗️ Component Structure

```
AdminPage.jsx (Main Page)
├── DashboardStats.jsx (Dashboard Tab)
│   ├── StatCard (Total, Pending, In Progress, Resolved)
│   ├── DistributionCard (Severity & District breakdowns)
│   ├── Status Overview Bar
│   └── Quick Insights
├── PotholeList.jsx (All Potholes Tab)
│   ├── Filter Section
│   │   ├── Search Input
│   │   ├── Status Filter Dropdown
│   │   ├── Severity Filter Dropdown
│   │   ├── District Filter Dropdown
│   │   ├── Date Range Filters
│   │   └── Sort By Dropdown
│   ├── Bulk Actions Bar (when items selected)
│   │   ├── Mark as Resolved Button
│   │   ├── Export Selected Button
│   │   └── Clear Selection Button
│   ├── Export Button
│   └── Pothole Table
│       ├── Checkbox Column (select items)
│       ├── Road Name
│       ├── District
│       ├── Location
│       ├── Severity Badge
│       ├── Status Badge
│       ├── Date Reported
│       └── Actions Column
│           ├── View Button
│           ├── Maps Button
│           ├── Status Dropdown (if not resolved)
│           └── Delete Button
├── PotholeDetailsModal.jsx (Detail View)
│   ├── Header (Pothole ID & Road Name)
│   ├── Info Grid
│   │   ├── Status Dropdown
│   │   ├── Severity Badge
│   │   ├── District
│   │   ├── Location
│   │   └── Date Reported
│   ├── Main Content (Two Column)
│   │   ├── Left: Details Section
│   │   │   ├── Description
│   │   │   ├── Reporter Information
│   │   │   │   ├── Name
│   │   │   │   ├── Phone (clickable)
│   │   │   │   └── Email (clickable)
│   │   │   └── Coordinates
│   │   └── Right: Map & Assignment
│   │       ├── Map (Embedded Map Component)
│   │       └── Staff Assignment
│   │           ├── Staff Dropdown
│   │           ├── Assign Button
│   │           └── Confirmation Message
│   ├── Photos Gallery
│   │   └── Photo Grid (Multiple images)
│   ├── Notes Section
│   │   ├── Note Input Textarea
│   │   ├── Add Note Button
│   │   └── Notes List
│   │       └── Note Cards (Author, Timestamp, Text)
│   └── Close Button
└── Analytics.jsx (Analytics Tab)
    ├── Metric Cards (Response Time, Hotspots)
    ├── Most Problematic Roads Section
    │   └── Road Cards (Severity breakdown, Progress)
    ├── Geographic Hotspots Section
    │   └── Hotspot Cards (Coordinates, Count, Map Button)
    ├── Reports Trend (7-Day Chart)
    └── Response Time Distribution
        ├── Status Distribution Bar
        └── Time Range Breakdown

```

## 📊 Data Flow

```
Backend API (http://localhost:3005)
    ↓
AdminPage.jsx
    ├→ fetchPotholes() 
    │   └→ Sets potholes state
    ├→ handleUpdateStatus(id, status)
    │   └→ Updates backend & local state
    ├→ handleDeletePothole(id)
    │   └→ Deletes from backend & local state
    ├→ handleSelectPothole(id)
    │   └→ Opens PotholeDetailsModal
    └→ handleAddNote(id, note)
        └→ Saves to localStorage

Child Components:
├─ DashboardStats
│  └─ Computes stats from potholes array
├─ PotholeList
│  ├─ Filters/searches potholes
│  ├─ Sorts results
│  └─ Calls handlers from parent
├─ PotholeDetailsModal
│  ├─ Displays selected pothole details
│  ├─ Manages notes in localStorage
│  └─ Allows status updates
└─ Analytics
   └─ Computes analytics from potholes array
```

## 🔄 State Management

### AdminPage State:
```javascript
potholes: Array          // List of all potholes from backend
loading: Boolean         // Loading state
error: String           // Error message
refreshing: Boolean     // Refresh button state
selectedPotholeId: Number   // Currently selected pothole for modal
activeTab: String       // Current tab (dashboard, list, analytics)
```

### PotholeList State:
```javascript
searchTerm: String      // Search input
filterStatus: String    // Status filter
filterSeverity: String  // Severity filter
filterDistrict: String  // District filter
filterDateFrom: String  // Date range start
filterDateTo: String    // Date range end
sortBy: String          // Sort column
selectedIds: Set        // Selected pothole IDs for bulk actions
showBulkActions: Boolean // Show/hide bulk actions bar
```

### PotholeDetailsModal State:
```javascript
notes: Array            // Array of notes for this pothole
newNote: String         // Current note being typed
newStatus: String       // Selected status for update
assignedStaff: String   // Selected staff member
staffList: Array        // Available staff members
loading: Boolean        // Operation in progress
```

## 🎨 Styling Approach

- **Inline Styles**: All components use inline styles for flexibility
- **CSS Classes**: Uses classes from global.css for common styling
- **Color Scheme**:
  - Primary: #0b64d1 (Blue)
  - Success: #10b981 (Green)
  - Warning: #f59e0b (Orange)
  - Danger: #e02424 (Red)
  - Background: #f9fafb (Light Gray)
  - Text: #374151 (Dark Gray)

## 🔌 API Endpoints Used

```
GET  /potholes              → Fetch all potholes
PUT  /potholes/:id          → Update pothole (status, assignment)
DELETE /potholes/:id        → Delete pothole
GET  /staff                 → Fetch staff list (optional)
```

## 📦 Dependencies

- `React`: UI framework
- `axios`: HTTP client for API calls
- `next/dynamic`: Dynamic imports (for Map component)
- `localStorage`: For persisting notes

## ✨ Key Features by Component

### DashboardStats
- Real-time statistics calculation
- Responsive grid layout
- Color-coded metrics
- Insight generation

### PotholeList
- Advanced filtering with multiple criteria
- Full-text search
- Sorting options
- Bulk operations support
- CSV export functionality
- Google Maps integration

### PotholeDetailsModal
- Modal overlay with backdrop click to close
- Photo gallery
- Embedded map
- Notes with timestamps
- Staff assignment
- Real-time status updates

### Analytics
- Geographic hotspot identification
- Road problem ranking
- Response time metrics
- 7-day trend visualization
- Distribution charts

## 🚀 Performance Considerations

1. **Memoization**: useMemo used for expensive calculations
2. **Auto-refresh**: Every 5 seconds to stay in sync
3. **Lazy Loading**: Map component dynamically imported
4. **Efficient Filtering**: Uses JavaScript array methods
5. **CSV Export**: Client-side generation for instant download

## 🔒 Security Features

- Authentication token in headers
- Protected routes with ProtectedRoute component
- Admin email display
- Confirmation dialogs for destructive actions

## 📱 Responsive Design

- Mobile-first approach
- CSS Grid with auto-fit
- Flexible column layouts
- Scrollable tables on small screens
- Touch-friendly buttons

---

**Component Relationships**: Each component is independently functional but works together through props and state management in AdminPage.jsx. This modular approach makes it easy to maintain, test, and extend the dashboard with new features.
