import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('read', false)
      .then(({ count }) => setNotifCount(count || 0))
  }, [user, location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (!user || profile?.status === 'pending') return null

  return (
    <nav style={{
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <Link to="/" style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:20, color:'var(--accent2)' }}>
          ♪ LyricsApp
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link to="/" className="btn btn-ghost" style={{ padding:'7px 14px' }}>Chansons</Link>
          <Link to="/submit" className="btn btn-ghost" style={{ padding:'7px 14px' }}>+ Ajouter</Link>
          {isAdmin && (
            <Link to="/admin" className="btn btn-ghost" style={{ padding:'7px 14px', position:'relative' }}>
              Admin
              {notifCount > 0 && (
                <span style={{
                  position:'absolute', top:4, right:4,
                  background:'var(--accent)', color:'#fff',
                  borderRadius:'99px', fontSize:10, padding:'1px 5px', fontWeight:700
                }}>{notifCount}</span>
              )}
            </Link>
          )}
          <div style={{ width:1, height:24, background:'var(--border2)', margin:'0 4px' }} />
          <span style={{ fontSize:13, color:'var(--text2)' }}>{profile?.name}</span>
          <button onClick={handleSignOut} className="btn btn-ghost" style={{ padding:'7px 14px', fontSize:13 }}>
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
