'use client'
import { useState } from 'react'

export default function Home() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      window.location.href = '/vault'
    } else {
      const t = await res.text()
      setMsg(t || 'Failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-4">
        {mode === 'login' ? 'Login' : 'Create account'}
      </h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-black text-white rounded p-2">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      {msg && <p className="mt-3 text-red-600 text-sm">{msg}</p>}

      <p className="mt-4 text-sm">
        {mode === 'login' ? 'No account?' : 'Have an account?'}{' '}
        <button
          className="underline"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  )
}
