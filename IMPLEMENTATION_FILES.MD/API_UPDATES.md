# Frontend API Updates - Admin Dashboard

## Summary
Updated all frontend API calls to match the new backend admin dashboard endpoints. All requests now include authorization tokens.

---

## Endpoint Changes

### 1. GET /admin/dashboard/potholes (List Potholes)
**File:** `src/pages/AdminPage.jsx`

**Changes:**
- Old: `GET /potholes`
- New: `GET /admin/dashboard/potholes`

**Features:**
- Supports optional query parameters: `status`, `severity`, `district`
- Parameters are passed from PotholeList filter component
- Status values: "Pending", "In Progress", "Resolved"
- Severity values: "LOW", "MEDIUM", "HIGH" (converted to uppercase)
- District: string value from filter

**Example:**
```javascript
const url = `/admin/dashboard/potholes?status=Pending&severity=HIGH&district=Lilongwe`
```

---

### 2. GET /admin/dashboard/potholes/:id (Get Pothole Details)
**File:** `src/components/PotholeDetailsModal.jsx`

**Changes:**
- Old: `GET /potholes/:id`
- New: `GET /admin/dashboard/potholes/:id`

**Response:** Includes pothole details with photo array

---

### 3. GET /admin/dashboard/potholes/:id/photos (Get Pothole Photos)
**File:** Not currently used in frontend

**Available for:** Future photo management features

---

### 4. DELETE /admin/dashboard/potholes/:id (Delete Pothole)
**Files:** 
- `src/pages/AdminPage.jsx` (handleDeletePothole)
- `src/components/PotholeDetailsModal.jsx` (if delete button added)

**Changes:**
- Old: `DELETE /potholes/:id`
- New: `DELETE /admin/dashboard/potholes/:id`

---

### 5. GET /admin/dashboard/stats (Get Dashboard Statistics)
**File:** `src/components/DashboardStats.jsx`

**Changes:**
- New endpoint: `GET /admin/dashboard/stats`
- Previously calculated from potholes array on client-side

**Response Format:**
```json
{
  "total": 10,
  "byStatus": [
    { "status": "Pending", "count": 5 },
    { "status": "In Progress", "count": 3 },
    { "status": "Resolved", "count": 2 }
  ],
  "bySeverity": [
    { "severity": "LOW", "count": 4 },
    { "severity": "MEDIUM", "count": 4 },
    { "severity": "HIGH", "count": 2 }
  ],
  "topDistricts": [
    { "district": "Lilongwe", "count": 5 },
    { "district": "Blantyre", "count": 3 },
    { "district": "Mzuzu", "count": 2 }
  ]
}
```

---

## Component Updates

### AdminPage.jsx
- `fetchPotholes()` now accepts optional `filters` parameter
- Filters are built into query parameters for the API
- New handler: `handleFiltersChange()` passes filters to API
- Passes `apiClient` and `onFiltersChange` to PotholeList

### PotholeList.jsx
- Added `onFiltersChange` prop to accept parent handler
- Added `apiClient` prop for future direct API calls
- Filter change handlers now call `onFiltersChange()` with current filters
- Severity values converted to uppercase before sending to API

### DashboardStats.jsx
- Refactored to fetch stats from `/admin/dashboard/stats` endpoint
- Includes fallback to client-side calculation if API fails
- Added `apiClient` prop for flexibility
- Maps API response format to component state

### PotholeDetailsModal.jsx
- Updated delete endpoint to `/admin/dashboard/potholes/:id`
- Added `fetchPotholeDetails()` to fetch from new endpoint

---

## Authorization
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer {TOKEN}
```

Token is stored in `localStorage.getItem("authToken")`

---

## Testing Checklist
- [ ] Fetch potholes list without filters
- [ ] Fetch potholes with status filter
- [ ] Fetch potholes with severity filter
- [ ] Fetch potholes with district filter
- [ ] Fetch potholes with combined filters
- [ ] Fetch dashboard stats
- [ ] Delete pothole record
- [ ] Update pothole status
- [ ] Verify authorization headers are sent
- [ ] Test error handling for 401 Unauthorized

