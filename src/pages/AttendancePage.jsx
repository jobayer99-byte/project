import { useState, useEffect } from 'react'
import useClock from '../hooks/useClock'
import { studentLogin, submitAttendance } from '../utils/api'

export default function AttendancePage() {
  const [token,     setToken]     = useState(() => sessionStorage.getItem('s_token') || '')
  const [student,   setStudent]   = useState(() => sessionStorage.getItem('s_name')  || '')
  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [msg,       setMsg]       = useState(null)
  const [loading,   setLoading]   = useState(false)

  // attendance form state
  const [status,    setStatus]    = useState('')
  const [taskDone,  setTaskDone]  = useState('')
  const [workHours, setWorkHours] = useState('')

  const clock = useClock()

  function showMsg(type, text) {
    setMsg({ type, text })
    if (type === 'success') setTimeout(() => setMsg(null), 4000)
  }

  async function login(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const data = await studentLogin(username, password)
      sessionStorage.setItem('s_token', data.token)
      sessionStorage.setItem('s_name',  data.name)
      setToken(data.token); setStudent(data.name)
    } catch (err) { showMsg('error', '❌ ' + err.message) }
    setLoading(false)
  }

  function logout() {
    sessionStorage.removeItem('s_token'); sessionStorage.removeItem('s_name')
    setToken(''); setStudent(''); setUsername(''); setPassword('')
    setStatus(''); setTaskDone(''); setWorkHours('')
  }

  async function submit() {
    if (!status)    { showMsg('error', '⚠️ Attendance status বেছে নাও!'); return }
    if (!taskDone)  { showMsg('error', '⚠️ আগের দিনের task complete হয়েছে কিনা বলো!'); return }
    if (!workHours) { showMsg('error', '⚠️ কত ঘণ্টা কাজ করেছো বলো!'); return }
    setLoading(true); setMsg(null)
    try {
      await submitAttendance(token, { status, taskDone, workHours: Number(workHours) })
      showMsg('success', `✅ ${student} — Attendance সফলভাবে দেওয়া হয়েছে!`)
      setStatus(''); setTaskDone(''); setWorkHours('')
    } catch (err) { showMsg('error', '❌ ' + err.message) }
    setLoading(false)
  }

  // ── Login form ──
  if (!token) return (
    <div className="page">
      <div className="card login-card">
        <div className="clock-box">
          <div className="clock-time">{clock.time}</div>
          <div className="clock-date">{clock.date}</div>
        </div>
        <h2 style={{ marginBottom: 6 }}>🔐 Student Login</h2>
        <p className="subtitle">তোমার username ও password দাও</p>
        <form onSubmit={login}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          {/* Password with show/hide */}
          <div className="pass-wrap" style={{ marginTop: 10 }}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="button" className="pass-eye" onClick={() => setShowPass(p => !p)}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {msg && <p className="login-err" style={{ marginTop: 8 }}>{msg.text}</p>}
          <button className="btn btn-primary full-w" style={{ marginTop: 14 }} disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )

  // ── Attendance form ──
  return (
    <div className="page">
      <div className="card">
        {/* Clock */}
        <div className="clock-box">
          <div className="clock-time">{clock.time}</div>
          <div className="clock-date">{clock.date}</div>
        </div>

        {/* Welcome */}
        <div className="student-welcome">
          <span>👋 <strong>{student}</strong></span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>

        {/* ── Attendance ── */}
        <p className="form-label">আজকের Attendance</p>
        <div className="option-group">
          <button
            className={`opt-btn ${status === 'Present' ? 'opt-green active' : 'opt-green'}`}
            onClick={() => setStatus('Present')}
          >✅ Present</button>
          <button
            className={`opt-btn ${status === 'Absent' ? 'opt-red active' : 'opt-red'}`}
            onClick={() => setStatus('Absent')}
          >❌ Absent</button>
        </div>

        {/* ── Task done ── */}
        <p className="form-label" style={{ marginTop: 18 }}>আগের দিনের Task complete হয়েছে?</p>
        <div className="option-group">
          <button
            className={`opt-btn ${taskDone === 'Yes' ? 'opt-green active' : 'opt-green'}`}
            onClick={() => setTaskDone('Yes')}
          >👍 Yes</button>
          <button
            className={`opt-btn ${taskDone === 'No' ? 'opt-red active' : 'opt-red'}`}
            onClick={() => setTaskDone('No')}
          >👎 No</button>
        </div>

        {/* ── Work hours ── */}
        <p className="form-label" style={{ marginTop: 18 }}>আজকে কত ঘণ্টা কাজ করেছো?</p>
        <div className="hours-group">
          {[1,2,3,4,5,6,7].map(h => (
            <button
              key={h}
              className={`hour-btn ${workHours === h ? 'active' : ''}`}
              onClick={() => setWorkHours(h)}
            >{h}h</button>
          ))}
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary full-w"
          style={{ marginTop: 22 }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Saving...' : '📤 Submit Attendance'}
        </button>

        {msg && (
          <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  )
}
