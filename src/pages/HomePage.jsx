import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchSongs()
  }, [])

  async function fetchSongs() {
    const query = supabase.from('songs').select(`*, profiles:submitted_by(name)`).order('created_at', { ascending: false })
    if (!isAdmin) query.eq('status', 'approved')
    const { data } = await query
    setSongs(data || [])
    setLoading(false)
  }

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page" style={{ padding:'32px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:32 }}>Paroles</h1>
            <p style={{ color:'var(--text2)', marginTop:4 }}>{songs.length} chanson{songs.length > 1 ? 's' : ''} dans la bibliothèque</p>
          </div>
          <Link to="/submit" className="btn btn-primary">+ Ajouter une chanson</Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom:28 }}>
          <input
            type="text"
            placeholder="🔍  Chercher par titre ou artiste..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth:440 }}
          />
        </div>

        {/* Songs grid */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{width:36,height:36}} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>♪</div>
            <p>{search ? 'Aucune chanson trouvée' : 'Aucune chanson pour l\'instant'}</p>
            {!search && <Link to="/submit" className="btn btn-ghost" style={{ marginTop:16, display:'inline-flex' }}>Ajouter la première</Link>}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
            {filtered.map(song => (
              <Link to={`/song/${song.id}`} key={song.id} style={{ display:'block' }}>
                <div className="card" style={{ cursor:'pointer', transition:'all 0.2s', border:'1px solid var(--border)', height:'100%' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{
                      width:44, height:44, borderRadius:10,
                      background:`linear-gradient(135deg, var(--accent), var(--accent2))`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:20, flexShrink:0
                    }}>♪</div>
                    <span className={`badge badge-${song.status}`}>
                      {{ pending:'En attente', approved:'Approuvée', rejected:'Refusée' }[song.status]}
                    </span>
                  </div>
                  <h3 style={{ fontSize:17, marginBottom:4, fontFamily:'var(--font-head)' }}>{song.title}</h3>
                  <p style={{ color:'var(--text2)', fontSize:13 }}>{song.artist}</p>
                  <p style={{ color:'var(--text3)', fontSize:12, marginTop:10 }}>
                    Par {song.profiles?.name || 'Inconnu'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
