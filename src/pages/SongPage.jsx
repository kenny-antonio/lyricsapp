import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function SongPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, isAdmin } = useAuth()
  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(18)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchSong() }, [id])

  async function fetchSong() {
    const { data } = await supabase.from('songs')
      .select('*, profiles:submitted_by(name), reviewer:reviewed_by(name)')
      .eq('id', id).single()
    setSong(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette chanson définitivement ?')) return
    setDeleting(true)
    await supabase.from('songs').delete().eq('id', id)
    navigate('/')
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{width:36,height:36}} /></div>
  if (!song) return <div style={{ textAlign:'center', padding:80 }}><p>Chanson introuvable</p><Link to="/" className="btn btn-ghost" style={{marginTop:16,display:'inline-flex'}}>Retour</Link></div>

  const canEdit = isAdmin || (profile?.status === 'active' && song.submitted_by === user?.id)

  return (
    <div className="page" style={{ padding:'32px 0 80px' }}>
      <div className="container" style={{ maxWidth:780 }}>
        {/* Back */}
        <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:14, marginBottom:28 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
          ← Retour aux chansons
        </Link>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <h1 style={{ fontSize:34 }}>{song.title}</h1>
              <span className={`badge badge-${song.status}`}>
                {{ pending:'En attente', approved:'Approuvée', rejected:'Refusée' }[song.status]}
              </span>
            </div>
            <p style={{ color:'var(--text2)', fontSize:18 }}>{song.artist}</p>
            <p style={{ color:'var(--text3)', fontSize:13, marginTop:6 }}>
              Ajouté par {song.profiles?.name || 'Inconnu'}
              {song.reviewer?.name && ` · Validé par ${song.reviewer.name}`}
            </p>
            {song.review_note && (
              <div style={{ marginTop:10, padding:'8px 14px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, fontSize:13, color:'var(--danger)' }}>
                Note admin : {song.review_note}
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {canEdit && <Link to={`/song/${id}/edit`} className="btn btn-ghost">✏️ Modifier</Link>}
            {isAdmin && <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>{deleting ? 'Suppression...' : '🗑 Supprimer'}</button>}
          </div>
        </div>

        {/* Zoom controls */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, padding:'12px 16px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', width:'fit-content' }}>
          <span style={{ fontSize:13, color:'var(--text2)' }}>Taille des paroles</span>
          <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="btn btn-ghost" style={{ padding:'4px 10px', fontSize:16 }}>A-</button>
          <span style={{ fontSize:14, color:'var(--text2)', minWidth:40, textAlign:'center' }}>{fontSize}px</span>
          <button onClick={() => setFontSize(f => Math.min(40, f + 2))} className="btn btn-ghost" style={{ padding:'4px 10px', fontSize:16 }}>A+</button>
          <button onClick={() => setFontSize(18)} className="btn btn-ghost" style={{ padding:'4px 10px', fontSize:12 }}>Reset</button>
        </div>

        {/* Lyrics */}
        <div className="card" style={{ padding:32 }}>
          <pre style={{
            fontFamily:'var(--font-body)',
            fontSize: fontSize + 'px',
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
            color: 'var(--text)',
            wordBreak: 'break-word'
          }}>
            {song.lyrics}
          </pre>
        </div>
      </div>
    </div>
  )
}
