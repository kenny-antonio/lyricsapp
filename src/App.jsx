import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import SongPage from './pages/SongPage'
import SubmitSongPage from './pages/SubmitSongPage'
import EditSongPage from './pages/EditSongPage'
import AdminPage from './pages/AdminPage'
import PendingPage from './pages/PendingPage'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" style={{width:40,height:40}} /></div>
  if (!user) return <Navigate to="/login" />
  if (profile?.status === 'pending') return <Navigate to="/pending" />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" />
  return children
}

function AppRoutes() {
  const { user, profile } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user && profile?.status !== 'pending' ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/song/:id" element={<PrivateRoute><SongPage /></PrivateRoute>} />
        <Route path="/submit" element={<PrivateRoute><SubmitSongPage /></PrivateRoute>} />
        <Route path="/song/:id/edit" element={<PrivateRoute><EditSongPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
