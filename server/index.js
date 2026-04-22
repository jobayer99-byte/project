const express = require('express')
const cors    = require('cors')
const jwt     = require('jsonwebtoken')
const fs      = require('fs')
const path    = require('path')

const app    = express()
const PORT   = 5000
const SECRET = 'attendance_secret_key'
const DB     = path.join(__dirname, 'db.json')

app.use(cors())
app.use(express.json())

const readDB  = () => JSON.parse(fs.readFileSync(DB, 'utf8'))
const writeDB = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2))

// ── Auth middleware ───────────────────────────────────────
function authStudent(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try { req.user = jwt.verify(token, SECRET); next() }
  catch { res.status(401).json({ message: 'Invalid token' }) }
}
function authAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const user = jwt.verify(token, SECRET)
    if (user.role !== 'admin') return res.status(403).json({ message: 'Not admin' })
    req.user = user; next()
  } catch { res.status(401).json({ message: 'Invalid token' }) }
}

// ── Student Login ─────────────────────────────────────────
app.post('/api/student/login', (req, res) => {
  const { username, password } = req.body
  const db = readDB()
  const student = db.students.find(
    s => s.username === username.trim().toLowerCase() && s.password === password
  )
  if (!student) return res.status(401).json({ message: 'Username বা Password ভুল!' })
  const token = jwt.sign({ id: student.id, name: student.name, role: 'student' }, SECRET, { expiresIn: '12h' })
  res.json({ token, name: student.name, id: student.id })
})

// ── Admin Login ───────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'jobayer' && password === 'jobayer@admin') {
    const token = jwt.sign({ role: 'admin', name: 'Jobayer Ahmmed' }, SECRET, { expiresIn: '24h' })
    return res.json({ token, name: 'Jobayer Ahmmed' })
  }
  res.status(401).json({ message: 'Username বা Password ভুল!' })
})

// ── Submit Attendance ─────────────────────────────────────
app.post('/api/attendance', authStudent, (req, res) => {
  const { status, taskDone, workHours } = req.body
  if (!['Present', 'Absent'].includes(status))
    return res.status(400).json({ message: 'Invalid status' })
  if (!['Yes', 'No'].includes(taskDone))
    return res.status(400).json({ message: 'Task status required' })
  if (![1,2,3,4,5,6,7].includes(Number(workHours)))
    return res.status(400).json({ message: 'Work hours required' })

  const db  = readDB()
  const now = new Date()
  const today = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' })

  const already = db.attendance.find(a => a.studentId === req.user.id && a.date === today)
  if (already) return res.status(409).json({ message: 'আজকের attendance আগেই দেওয়া হয়েছে!' })

  db.attendance.push({
    id:        Date.now(),
    studentId: req.user.id,
    name:      req.user.name,
    status,
    taskDone,
    workHours: Number(workHours),
    date:  today,
    time:  now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }),
    datetime: now.toISOString()
  })
  writeDB(db)
  res.json({ success: true })
})

// ── Get Attendance (admin) ────────────────────────────────
app.get('/api/attendance', authAdmin, (req, res) => {
  const db = readDB()
  let records = db.attendance
  const { date, name } = req.query
  if (date) records = records.filter(r => r.date === date)
  if (name) records = records.filter(r => r.name === name)
  res.json([...records].reverse())
})

// ── Delete Attendance (admin) ─────────────────────────────
app.delete('/api/attendance/:id', authAdmin, (req, res) => {
  const db = readDB()
  db.attendance = db.attendance.filter(a => a.id !== Number(req.params.id))
  writeDB(db)
  res.json({ success: true })
})

// ── Get Students (admin) — password সহ ───────────────────
app.get('/api/students', authAdmin, (req, res) => {
  const db = readDB()
  res.json(db.students.map(s => ({ id: s.id, name: s.name, username: s.username, password: s.password })))
})

// ── Update student password (admin) ──────────────────────
app.put('/api/students/:id/password', authAdmin, (req, res) => {
  const db = readDB()
  const student = db.students.find(s => s.id === Number(req.params.id))
  if (!student) return res.status(404).json({ message: 'Student not found' })
  student.password = req.body.password
  writeDB(db)
  res.json({ success: true })
})

app.listen(PORT, () => console.log(`✅ Server → http://localhost:${PORT}`))
