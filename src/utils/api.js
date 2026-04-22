const BASE = 'http://localhost:5000'

function headers(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export async function studentLogin(username, password) {
  const r = await fetch(`${BASE}/api/student/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, password })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message)
  return data
}

export async function adminLogin(username, password) {
  const r = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username, password })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message)
  return data
}

export async function submitAttendance(token, { status, taskDone, workHours }) {
  const r = await fetch(`${BASE}/api/attendance`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ status, taskDone, workHours })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message)
  return data
}

export async function getAttendance(token, { date = '', name = '' } = {}) {
  let url = `${BASE}/api/attendance?`
  if (date) url += `date=${date}&`
  if (name) url += `name=${encodeURIComponent(name)}`
  const r = await fetch(url, { headers: headers(token) })
  if (!r.ok) throw new Error('Unauthorized')
  return r.json()
}

export async function deleteAttendance(token, id) {
  await fetch(`${BASE}/api/attendance/${id}`, {
    method: 'DELETE',
    headers: headers(token)
  })
}

export async function getStudents(token) {
  const r = await fetch(`${BASE}/api/students`, { headers: headers(token) })
  return r.json()
}

export async function updatePassword(token, id, password) {
  const r = await fetch(`${BASE}/api/students/${id}/password`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ password })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.message)
  return data
}
