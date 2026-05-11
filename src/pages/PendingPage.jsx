import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function PendingPage() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="page" style={{ alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ textAlign:'center', maxWidth:420 }} className="fade-in">
        <div style={{ fontSize:56, marginBottom:20 }}>⏳</div>
        <h2 style={{ fontSize:24, marginBottom:12 }}>Compte en attente</h2>
        <p style={{ color:'var(--text2)', lineHeight:1.8, marginBottom:8 }}>
          Salut <strong style={{ color:'var(--text)' }}>{profile?.name}</strong> ! Ton compte est en cours de validation par l'admin.
        </p>
        <p style={{ color:'var(--text3)', fontSize:14, marginBottom:28 }}>
          Tu recevras un accès une fois que ton inscription sera approuvée.
        </p>
        <button onClick={handleSignOut} className="btn btn-ghost">
          Déconnexion
        </button>
      </div>
    </div>
  )
}
