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

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (mode === 'register') {
        // ✅ After registration — don't log in, ask user to log in manually
        if (res.ok) {
          setMsg('✅ Account created successfully! Please log in.')
          setMode('login') // switch to login form
          setPassword('') // clear password field
        } else {
          const t = await res.text()
          setMsg(t || '❌ Registration failed')
        }
        return
      }

      // ✅ Login flow
      if (res.ok) {
        window.location.href = '/vault'
      } else {
        const t = await res.text()
        setMsg(t || '❌ Invalid email or password')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      setMsg('❌ Something went wrong. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-300">
      <h1 className="text-2xl font-semibold mb-4 text-center text-white">
        {mode === 'login' ? 'Login' : 'Create Account'}
      </h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border border-gray-400 rounded p-2 text-white placeholder-gray-300 bg-transparent"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border border-gray-400 rounded p-2 text-white placeholder-gray-300 bg-transparent"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2 font-medium transition"
          type="submit"
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      {msg && (
        <p
          className={`mt-3 text-center text-sm ${
            msg.includes('successfully') ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {msg}
        </p>
      )}

      <p className="mt-4 text-sm text-center text-gray-200">
        {mode === 'login' ? 'No account?' : 'Have an account?'}{' '}
        <button
          className="underline hover:text-blue-300 transition"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  )
}
