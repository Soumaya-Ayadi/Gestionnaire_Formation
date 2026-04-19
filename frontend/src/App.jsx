import PropTypes from 'prop-types'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Formations from './pages/Formations.jsx'
import Participants from './pages/Participants.jsx'
import Formateurs from './pages/Formateurs.jsx'
import Statistiques from './pages/Statistiques.jsx'
import Referentiels from './pages/Referentiels.jsx'
import Utilisateurs from './pages/Utilisateurs.jsx'

function ProtectedRoute({ children, roles = [] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="formations" element={<Formations />} />
            <Route path="participants" element={<Participants />} />
            <Route path="formateurs" element={<Formateurs />} />
            <Route path="statistiques" element={
              <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_RESPONSABLE']}>
                <Statistiques />
              </ProtectedRoute>
            } />
            <Route path="referentiels" element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <Referentiels />
              </ProtectedRoute>
            } />
            <Route path="utilisateurs" element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <Utilisateurs />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
