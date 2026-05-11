import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError('Email ou mot de passe incorrect')
    else navigate('/')
  }

  return (
    <div className="page" style={{ alignItems:'center', justifyContent:'center', padding:'40px 16px' }}>
      <div style={{ width:'100%', maxWidth:420 }} className="fade-in">
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>♪</div>
          <h1 style={{ fontSize:28, marginBottom:8 }}>Connexion</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>Accède aux paroles de ton groupe</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop:4, justifyContent:'center', padding:'13px' }}>
              {loading ? <><span className="spinner" style={{width:16,height:16}} /> Connexion...</> : 'Se connecter'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', marginTop:20, color:'var(--text2)', fontSize:14 }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color:'var(--accent2)', fontWeight:500 }}>Demander l'accès</Link>
        </p>
      </div>
    </div>
  )
}
