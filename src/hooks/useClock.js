import { useState, useEffect } from 'react'

export default function useClock() {
  const [clock, setClock] = useState({ time: '', date: '' })

  useEffect(() => {
    function tick() {
      const now = new Date()
      setClock({
        time: now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: now.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  return clock
}
