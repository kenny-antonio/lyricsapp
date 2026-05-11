import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function SubmitSongPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', artist: '', lyrics: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.artist.trim() || !form.lyrics.trim()) {
      setError('Tous les champs sont obligatoires')
      return
    }
    setError(''); setLoading(true)
    const { data, error: err } = await supabase.from('songs').insert({
      title: form.title.trim(),
      artist: form.artist.trim(),
      lyrics: form.lyrics.trim(),
      submitted_by: user.id,
      status: isAdmin ? 'approved' : 'pending'
    }).select().single()

    setLoading(false)
    if (err) { setError(err.message); return }

    // Notifier l'admin si ce n'est pas lui qui soumet
    if (!isAdmin) {
      await supabase.from('notifications').insert({
        user_id: user.id, // sera mis à jour vers l'admin dans un vrai projet avec RPC
        type: 'new_song',
        message: `Nouvelle chanson en attente : "${form.title}"`,
        ref_id: data.id
      })
    }
    navigate(isAdmin ? `/song/${data.id}` : '/')
  }

  return (
    <div className="page" style={{ padding:'32px 0 80px' }}>
      <div className="container" style={{ maxWidth:640 }}>
        <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:14, marginBottom:28 }}>← Retour</Link>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, marginBottom:6 }}>Ajouter une chanson</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>
            {isAdmin ? 'En tant qu\'admin, ta chanson sera publiée immédiatement.' : 'Ta chanson sera soumise à validation avant d\'être visible.'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group">
                <label>Titre *</label>
                <input placeholder="Ex: Bohemian Rhapsody" value={form.title} onChange={set('title')} required />
              </div>
              <div className="form-group">
                <label>Artiste *</label>
                <input placeholder="Ex: Queen" value={form.artist} onChange={set('artist')} required />
              </div>
            </div>
            <div className="form-group">
              <label>Paroles *</label>
              <textarea
                placeholder="Colle les paroles ici..."
                value={form.lyrics}
                onChange={set('lyrics')}
                style={{ minHeight:300, fontFamily:'var(--font-body)', fontSize:14 }}
                required
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <Link to="/" className="btn btn-ghost">Annuler</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" style={{width:14,height:14}} /> Envoi...</> : isAdmin ? '✓ Publier' : '📤 Soumettre'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
