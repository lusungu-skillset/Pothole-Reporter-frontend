import AdminPage from '../src/pages/AdminPage'
import ProtectedRoute from '../src/components/ProtectedRoute'

export default function AdminPageWrapper() {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  )
}
