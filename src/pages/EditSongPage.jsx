import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function EditSongPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [song, setSong] = useState(null)
  const [form, setForm] = useState({ title: '', artist: '', lyrics: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('songs').select('*').eq('id', id).single().then(({ data }) => {
      setSong(data)
      if (data) setForm({ title: data.title, artist: data.artist, lyrics: data.lyrics })
    })
  }, [id])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.artist.trim() || !form.lyrics.trim()) {
      setError('Tous les champs sont obligatoires'); return
    }
    setError(''); setLoading(true)

    if (isAdmin) {
      // Admin : modification directe
      const { error: err } = await supabase.from('songs').update({
        title: form.title.trim(),
        artist: form.artist.trim(),
        lyrics: form.lyrics.trim()
      }).eq('id', id)
      setLoading(false)
      if (err) { setError(err.message); return }
      navigate(`/song/${id}`)
    } else {
      // Membre : on crée une demande de modification
      const { error: err } = await supabase.from('song_edits').insert({
        song_id: id,
        edited_by: user.id,
        old_title: song.title, old_artist: song.artist, old_lyrics: song.lyrics,
        new_title: form.title.trim(), new_artist: form.artist.trim(), new_lyrics: form.lyrics.trim(),
        status: 'pending'
      })
      setLoading(false)
      if (err) { setError(err.message); return }
      navigate(`/song/${id}`)
    }
  }

  if (!song) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{width:36,height:36}} /></div>

  return (
    <div className="page" style={{ padding:'32px 0 80px' }}>
      <div className="container" style={{ maxWidth:640 }}>
        <Link to={`/song/${id}`} style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:14, marginBottom:28 }}>← Retour</Link>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, marginBottom:6 }}>Modifier la chanson</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>
            {isAdmin ? 'Tes modifications seront appliquées immédiatement.' : 'Tes modifications seront soumises à validation.'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label>Titre</label>
                <input value={form.title} onChange={set('title')} required />
              </div>
              <div className="form-group">
                <label>Artiste</label>
                <input value={form.artist} onChange={set('artist')} required />
              </div>
            </div>
            <div className="form-group">
              <label>Paroles</label>
              <textarea value={form.lyrics} onChange={set('lyrics')} style={{ minHeight:300, fontSize:14 }} required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <Link to={`/song/${id}`} className="btn btn-ghost">Annuler</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" style={{width:14,height:14}} /> Enregistrement...</> : isAdmin ? '✓ Sauvegarder' : '📤 Soumettre la modification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
