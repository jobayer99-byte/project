import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import AttendancePage from './pages/AttendancePage'
import RecordsPage from './pages/RecordsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <HashRouter>
      <header className="site-header">
        <h1>Wordpress Course By Jobayer Ahmmed</h1>
        <p>Student Attendance System</p>
      </header>

      <nav className="site-nav">
        <NavLink to="/"        className={({ isActive }) => isActive ? 'active' : ''}>🏠 Attendance</NavLink>
        <NavLink to="/records" className={({ isActive }) => isActive ? 'active' : ''}>📊 Records</NavLink>
        <NavLink to="/admin"   className={({ isActive }) => isActive ? 'active' : ''}>⚙️ Admin</NavLink>
      </nav>

      <main>
        <Routes>
          <Route path="/"        element={<AttendancePage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/admin"   element={<AdminPage />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
