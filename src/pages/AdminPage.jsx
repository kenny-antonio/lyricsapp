import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TABS = ['Membres en attente', 'Chansons en attente', 'Modifications en attente', 'Tous les membres']

export default function AdminPage() {
  const [tab, setTab] = useState(0)
  const [pendingUsers, setPendingUsers] = useState([])
  const [pendingSongs, setPendingSongs] = useState([])
  const [pendingEdits, setPendingEdits] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: pu }, { data: ps }, { data: pe }, { data: am }] = await Promise.all([
      supabase.from('profiles').select('*').eq('status', 'pending').order('created_at'),
      supabase.from('songs').select('*, profiles:submitted_by(name)').eq('status', 'pending').order('created_at'),
      supabase.from('song_edits').select('*, songs(*), profiles:edited_by(name)').eq('status', 'pending').order('created_at'),
      supabase.from('profiles').select('*').neq('status', 'pending').order('created_at', { ascending: false })
    ])
    setPendingUsers(pu || [])
    setPendingSongs(ps || [])
    setPendingEdits(pe || [])
    setAllMembers(am || [])
    setLoading(false)
  }

  async function approveUser(userId) {
    setProcessing(userId)
    await supabase.from('profiles').update({ status: 'active' }).eq('id', userId)
    await fetchAll()
    setProcessing(null)
  }

  async function rejectUser(userId) {
    if (!confirm('Refuser et supprimer ce compte ?')) return
    setProcessing(userId)
    await supabase.auth.admin?.deleteUser(userId)
    await supabase.from('profiles').delete().eq('id', userId)
    await fetchAll()
    setProcessing(null)
  }

  async function reviewSong(songId, status, note = '') {
    setProcessing(songId)
    await supabase.from('songs').update({ status, review_note: note || null }).eq('id', songId)
    await fetchAll()
    setProcessing(null)
  }

  async function reviewEdit(edit, status) {
    setProcessing(edit.id)
    if (status === 'approved') {
      await supabase.from('songs').update({
        title: edit.new_title, artist: edit.new_artist, lyrics: edit.new_lyrics
      }).eq('id', edit.song_id)
    }
    await supabase.from('song_edits').update({ status }).eq('id', edit.id)
    await fetchAll()
    setProcessing(null)
  }

  async function toggleMemberStatus(member) {
    const newStatus = member.status === 'active' ? 'suspended' : 'active'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', member.id)
    await fetchAll()
  }

  const counts = [pendingUsers.length, pendingSongs.length, pendingEdits.length, 0]

  return (
    <div className="page" style={{ padding:'32px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontSize:28, marginBottom:8 }}>Tableau de bord Admin</h1>
        <p style={{ color:'var(--text2)', marginBottom:28 }}>
          {pendingUsers.length + pendingSongs.length + pendingEdits.length} élément(s) en attente de validation
        </p>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--bg2)', padding:4, borderRadius:12, width:'fit-content', flexWrap:'wrap' }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              style={{
                padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:500,
                background: tab === i ? 'var(--accent)' : 'transparent',
                color: tab === i ? '#fff' : 'var(--text2)',
                position:'relative', transition:'all 0.2s'
              }}>
              {t}
              {counts[i] > 0 && (
                <span style={{
                  marginLeft:6, background: tab === i ? 'rgba(255,255,255,0.3)' : 'var(--accent)',
                  color:'#fff', borderRadius:'99px', fontSize:11, padding:'1px 6px', fontWeight:700
                }}>{counts[i]}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{width:36,height:36}} /></div>
        ) : (
          <>
            {/* Membres en attente */}
            {tab === 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {pendingUsers.length === 0 ? <EmptyState msg="Aucun membre en attente" /> : pendingUsers.map(u => (
                  <div key={u.id} className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                    <div>
                      <p style={{ fontWeight:600, fontFamily:'var(--font-head)' }}>{u.name}</p>
                      <p style={{ color:'var(--text2)', fontSize:13, marginTop:2 }}>Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => rejectUser(u.id)} className="btn btn-danger" disabled={processing === u.id}>Refuser</button>
                      <button onClick={() => approveUser(u.id)} className="btn btn-success" disabled={processing === u.id}>
                        {processing === u.id ? <span className="spinner" style={{width:14,height:14}} /> : '✓ Approuver'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chansons en attente */}
            {tab === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {pendingSongs.length === 0 ? <EmptyState msg="Aucune chanson en attente" /> : pendingSongs.map(s => (
                  <div key={s.id} className="card">
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16 }}>
                      <div>
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:18 }}>{s.title}</h3>
                        <p style={{ color:'var(--text2)', fontSize:14 }}>{s.artist} · par {s.profiles?.name}</p>
                      </div>
                      <Link to={`/song/${s.id}`} className="btn btn-ghost" style={{ fontSize:13 }}>Voir les paroles</Link>
                    </div>
                    <div style={{ background:'var(--bg3)', borderRadius:8, padding:'12px 16px', fontSize:13, lineHeight:1.7, maxHeight:120, overflow:'hidden', color:'var(--text2)', marginBottom:16 }}>
                      {s.lyrics.substring(0, 300)}{s.lyrics.length > 300 ? '...' : ''}
                    </div>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button onClick={() => {
                        const note = prompt('Raison du refus (optionnel) :')
                        if (note !== null) reviewSong(s.id, 'rejected', note)
                      }} className="btn btn-danger" disabled={processing === s.id}>Refuser</button>
                      <button onClick={() => reviewSong(s.id, 'approved')} className="btn btn-success" disabled={processing === s.id}>
                        {processing === s.id ? <span className="spinner" style={{width:14,height:14}} /> : '✓ Approuver'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modifications en attente */}
            {tab === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {pendingEdits.length === 0 ? <EmptyState msg="Aucune modification en attente" /> : pendingEdits.map(e => (
                  <div key={e.id} className="card">
                    <div style={{ marginBottom:16 }}>
                      <h3 style={{ fontFamily:'var(--font-head)', fontSize:16, marginBottom:4 }}>
                        Modification de : {e.songs?.title}
                      </h3>
                      <p style={{ color:'var(--text2)', fontSize:13 }}>Par {e.profiles?.name} · {new Date(e.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                      <div>
                        <p style={{ fontSize:12, color:'var(--text3)', marginBottom:6 }}>AVANT</p>
                        <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:8, padding:'10px 14px', fontSize:13, lineHeight:1.6, maxHeight:140, overflow:'auto', whiteSpace:'pre-wrap' }}>
                          {e.old_lyrics?.substring(0, 200)}...
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize:12, color:'var(--text3)', marginBottom:6 }}>APRÈS</p>
                        <div style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.15)', borderRadius:8, padding:'10px 14px', fontSize:13, lineHeight:1.6, maxHeight:140, overflow:'auto', whiteSpace:'pre-wrap' }}>
                          {e.new_lyrics?.substring(0, 200)}...
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button onClick={() => reviewEdit(e, 'rejected')} className="btn btn-danger" disabled={processing === e.id}>Refuser</button>
                      <button onClick={() => reviewEdit(e, 'approved')} className="btn btn-success" disabled={processing === e.id}>
                        {processing === e.id ? <span className="spinner" style={{width:14,height:14}} /> : '✓ Appliquer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tous les membres */}
            {tab === 3 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {allMembers.length === 0 ? <EmptyState msg="Aucun membre actif" /> : allMembers.map(m => (
                  <div key={m.id} className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', flexWrap:'wrap', gap:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-head)', fontWeight:700, color:'var(--accent2)' }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:600 }}>{m.name}</p>
                        <div style={{ display:'flex', gap:6, marginTop:4 }}>
                          <span className={`badge badge-${m.status === 'active' ? 'approved' : 'rejected'}`} style={{ fontSize:11 }}>{m.status}</span>
                          <span className="badge badge-pending" style={{ fontSize:11 }}>{m.role}</span>
                        </div>
                      </div>
                    </div>
                    {m.role !== 'admin' && (
                      <button onClick={() => toggleMemberStatus(m)} className="btn btn-ghost" style={{ fontSize:13 }}>
                        {m.status === 'active' ? 'Suspendre' : 'Réactiver'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ msg }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
      <div style={{ fontSize:36, marginBottom:12 }}>✓</div>
      <p>{msg}</p>
    </div>
  )
}
