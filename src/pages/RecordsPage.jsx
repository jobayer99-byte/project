import { useState, useEffect } from 'react'
import { getStudents, getRecords, fmtDate } from '../utils/storage'

export default function RecordsPage() {
  const [records,     setRecords]     = useState([])
  const [students,    setStudents]    = useState([])
  const [filterDate,  setFilterDate]  = useState('')
  const [filterName,  setFilterName]  = useState('')

  useEffect(() => { setStudents(getStudents()) }, [])

  useEffect(() => {
    let data = getRecords()
    if (filterDate) data = data.filter(r => r.date === fmtDate(filterDate))
    if (filterName) data = data.filter(r => r.name === filterName)
    setRecords([...data].reverse())
  }, [filterDate, filterName])

  const total   = records.length
  const present = records.filter(r => r.status === 'Present').length
  const absent  = total - present

  return (
    <div className="page-wide">
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
      </div>

      {/* Table */}
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
