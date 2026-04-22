
import { useState, useEffect } from 'react'
import { getAttendance, getStudents } from '../utils/api'

// Records page — admin token থাকলে দেখাবে, না থাকলে login বলবে
export default function RecordsPage() {
  const token = sessionStorage.getItem('a_token') || ''

  const [records,    setRecords]    = useState([])
  const [students,   setStudents]   = useState([])
  const [filterDate, setFilterDate] = useState('')
  const [filterName, setFilterName] = useState('')
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (!token) return
    getStudents(token).then(setStudents).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) return
    load()
  }, [token, filterDate, filterName])

  async function load() {
    try {
      const data = await getAttendance(token, { date: filterDate, name: filterName })
      setRecords(data)
      setError('')
    } catch {
      setError('Admin login করো Records দেখতে।')
    }
  }

  const total   = records.length
  const present = records.filter(r => r.status === 'Present').length
  const absent  = total - present

  if (!token || error) return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔒</p>
        <p>Records দেখতে <strong>Admin</strong> হিসেবে login করো।</p>
      </div>
    </div>
  )

  return (
    <div className="page-wide">
      <div className="stats">
        <div className="stat"><div className="num c-blue">{total}</div><div className="lbl">Total</div></div>
        <div className="stat"><div className="num c-green">{present}</div><div className="lbl">Present</div></div>
        <div className="stat"><div className="num c-red">{absent}</div><div className="lbl">Absent</div></div>
      </div>

      <div className="filters">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <select value={filterName} onChange={e => setFilterName(e.target.value)}>
          <option value="">— সব student —</option>
          {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <button className="btn btn-gray" onClick={() => { setFilterDate(''); setFilterName('') }}>Reset</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>নাম</th><th>Status</th><th>তারিখ</th><th>সময়</th></tr>
          </thead>
          <tbody>
            {records.length === 0
              ? <tr className="empty-row"><td colSpan={5}>কোনো record নেই।</td></tr>
              : records.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td><strong>{r.name}</strong></td>
                  <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
