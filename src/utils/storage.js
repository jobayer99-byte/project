export const DEFAULT_STUDENTS = [
  "Jobayer Ahmmed",
  "MD Kawser Hossain",
  "Lobna Khanam Rimi",
  "Sree Niloy Chandra Mandal",
  "Md Rahat",
  "MD. Muktadir Rahman Souad",
  "Shazahan Kobir",
  "MD. Motasim Billah Raihan",
  "Papia Akter Mim",
  "Uthsab Ghosh",
  "MD Wasim",
  "Md Shahriar Nafiz Rabbi",
  "Foysal Hossain",
]

export function getStudents() {
  const s = localStorage.getItem('att_students')
  return s ? JSON.parse(s) : DEFAULT_STUDENTS
}
export function saveStudents(list) {
  localStorage.setItem('att_students', JSON.stringify(list))
}
export function getRecords() {
  const r = localStorage.getItem('att_records')
  return r ? JSON.parse(r) : []
}
export function saveRecords(list) {
  localStorage.setItem('att_records', JSON.stringify(list))
}

export function nowDhaka() {
  const now = new Date()
  return {
    date: now.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' }),
    time: now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }),
    iso: now.toISOString(),
  }
}

export function fmtDate(dateStr) {
  // yyyy-mm-dd → dd/mm/yyyy
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}
