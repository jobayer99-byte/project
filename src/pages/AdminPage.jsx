import { useState, useEffect } from 'react'
import { getStudents, saveStudents, getRecords, saveRecords, fmtDate } from '../utils/storage'

const ADMIN_PASSWORD = 'jobayer556677@'

export default function AdminPage() {
  const [authed,      setAuthed]      = useState(false)
  const [pass,        setPass]        = useState('')
  const [passErr,     setPassErr]     = useState(false)
  const [records,     setRecords]     = useState([])
  const [students,    setStudents]    = useState([])
  const [filterDate,  setFilterDate]  = useState('')
  const [filterName,  setFilterName]  = useState('')
  const [newStudent,  setNewStudent]  = useState('')

  useEffect(() => {
    if (!authed) return
    setStudents(getStudents())
    loadRecords()
  }, [authed])

  useEffect(() => { if (authed) loadRecords() }, [filterDate, filterName])

  function loadRecords() {
    let data = getRecords()
    if (filterDate) data = data.filter(r => r.date === fmtDate(filterDate))
    if (filterName) data = data.filter(r => r.name === filterName)
    setRecords([...data].reverse())
  }

  function login() {
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setPassErr(false) }
    else setPassErr(true)
  }

  function deleteRecord(id) {
    if (!confirm('এই record টা delete করবে?')) return
    saveRecords(getRecords().filter(r => r.id !== id))
    loadRecords()
  }

  function exportCSV() {
    let csv = 'Name,Status,Date,Time\n'
    getRecords().reverse().forEach(r => { csv += `"${r.name}",${r.status},${r.date},${r.time}\n` })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  function addStudent() {
    const name = newStudent.trim()
    if (!name) return
    const list = getStudents()
    if (list.includes(name)) { alert('এই নাম already আছে!'); return }
    const updated = [...list, name]
    saveStudents(updated)
    setStudents(updated)
    setNewStudent('')
  }

  function removeStudent(i) {
    const list = getStudents()
    if (!confirm(`"${list[i]}" কে remove করবে?`)) return
    const updated = list.filter((_, idx) => idx !== i)
    saveStudents(updated)
    setStudents(updated)
  }

  const total   = records.length
  const present = records.filter(r => r.status === 'Present').length
  const absent  = total - present

  // ── Login ──
  if (!authed) return (
    <div className="page">
      <div className="card login-card">
        <h2>🔐 Admin Login</h2>
        <p className="subtitle">শুধু teacher এর জন্য</p>
        <input
          type="password"
          placeholder="Password দাও"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
        />
        {passErr && <p className="login-err">❌ Password ভুল!</p>}
        <button className="btn btn-primary full-w" onClick={login}>Login</button>
      </div>
    </div>
  )

  // ── Dashboard ──
  return (
    <div className="page-wide">
      <div className="admin-topbar">
        <span className="admin-title">⚙️ Admin Panel</span>
        <button className="btn btn-gray" onClick={() => { setAuthed(false); setPass('') }}>Logout</button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat"><div className="num c-blue">{total}</div><div className="lbl">Total</div></div>
        <div className="stat"><div className="num c-green">{present}</div><div className="lbl">Present</div></div>
        <div className="stat"><div className="num c-red">{absent}</div><div className="lbl">Absent</div></div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <select value={filterName} onChange={e => setFilterName(e.target.value)}>
          <option value="">— সব student —</option>
          {students.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-gray" onClick={() => { setFilterDate(''); setFilterName('') }}>Reset</button>
        <button className="btn btn-export" onClick={exportCSV}>⬇ CSV</button>
      </div>

      {/* Table */}
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table>
          <thead>
            <tr><th>#</th><th>নাম</th><th>Status</th><th>তারিখ</th><th>সময়</th><th>Del</th></tr>
          </thead>
          <tbody>
            {records.length === 0
              ? <tr className="empty-row"><td colSpan={6}>কোনো record নেই।</td></tr>
              : records.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td><strong>{r.name}</strong></td>
                  <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td><button className="btn btn-danger" onClick={() => deleteRecord(r.id)}>🗑</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Student Manager */}
      <div className="card">
        <p className="section-title">👥 Student List</p>
        <div className="tag-list">
          {students.map((s, i) => (
            <div className="tag" key={s}>
              {s}
              <button onClick={() => removeStudent(i)}>×</button>
            </div>
          ))}
        </div>
        <div className="add-row">
          <input
            type="text"
            placeholder="নতুন student এর নাম"
            value={newStudent}
            onChange={e => setNewStudent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStudent()}
          />
          <button className="btn btn-primary" onClick={addStudent}>+ Add</button>
        </div>
      </div>
    </div>
  )
}
