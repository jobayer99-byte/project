import { useState, useEffect } from 'react'
import useClock from '../hooks/useClock'
import { getStudents, getRecords, saveRecords, nowDhaka } from '../utils/storage'

export default function AttendancePage() {
  const [students, setStudents] = useState([])
  const [name, setName]         = useState('')
  const [msg, setMsg]           = useState(null)
  const clock = useClock()

  useEffect(() => { setStudents(getStudents()) }, [])

  function submit(status) {
    if (!name) { setMsg({ type: 'error', text: '⚠️ আগে তোমার নাম select করো!' }); return }
    const { date, time, iso } = nowDhaka()
    const records = getRecords()
    records.push({ id: Date.now(), name, status, date, time, datetime: iso })
    saveRecords(records)
    setMsg({ type: 'success', text: `✅ ${name} — ${status} হিসেবে নেওয়া হয়েছে!` })
    setName('')
    setTimeout(() => setMsg(null), 3500)
  }

  return (
    <div className="page">
      <div className="card">
        {/* Clock */}
        <div className="clock-box">
          <div className="clock-time">{clock.time}</div>
          <div className="clock-date">{clock.date}</div>
        </div>

        {/* Select */}
        <select value={name} onChange={e => setName(e.target.value)}>
          <option value="">— তোমার নাম বেছে নাও —</option>
          {students.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Buttons */}
        <div className="att-btns">
          <button className="btn-present" onClick={() => submit('Present')}>✅ Present</button>
          <button className="btn-absent"  onClick={() => submit('Absent')}>❌ Absent</button>
        </div>

        {/* Message */}
        {msg && <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>{msg.text}</div>}
      </div>
    </div>
  )
}
