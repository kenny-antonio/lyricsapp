import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Mot de passe minimum 6 caractères'); return }
    setError(''); setLoading(true)
    const { error } = await signUp(email, password, name)
    setLoading(false)
    if (error) setError(error.message)
    else setDone(true)
  }

  if (done) return (
    <div className="page" style={{ alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ textAlign:'center', maxWidth:400 }} className="fade-in">
        <div style={{ fontSize:48, marginBottom:16 }}>✉️</div>
        <h2 style={{ marginBottom:12 }}>Demande envoyée !</h2>
        <p style={{ color:'var(--text2)', lineHeight:1.7 }}>
          Ton compte est en attente de validation par l'admin. Tu seras notifié par email une fois activé.
        </p>
        <Link to="/login" className="btn btn-ghost" style={{ marginTop:24, display:'inline-flex' }}>Retour à la connexion</Link>
      </div>
    </div>
  )

  return (
    <div className="page" style={{ alignItems:'center', justifyContent:'center', padding:'40px 16px' }}>
      <div style={{ width:'100%', maxWidth:420 }} className="fade-in">
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎸</div>
          <h1 style={{ fontSize:28, marginBottom:8 }}>Rejoindre le groupe</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>L'admin devra valider ton compte</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label>Ton prénom / pseudo</label>
              <input type="text" placeholder="Ex: Antoine" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" placeholder="Min. 6 caractères" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:4, justifyContent:'center', padding:'13px' }}>
              {loading ? <><span className="spinner" style={{width:16,height:16}} /> Envoi...</> : 'Demander l\'accès'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', marginTop:20, color:'var(--text2)', fontSize:14 }}>
          Déjà un compte ? <Link to="/login" style={{ color:'var(--accent2)', fontWeight:500 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
