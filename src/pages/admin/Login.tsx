import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { adminLogin, adminVerify } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    adminVerify().then((ok) => {
      if (ok) void navigate('/admin/dashboard', { replace: true })
      setChecking(false)
    })
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) { setError('Password required'); return }

    setLoading(true)
    setError('')

    try {
      await adminLogin(password)
      void navigate('/admin/dashboard', { replace: true })
    } catch {
      setError('Invalid password. Try again.')
      setLoading(false)
    }
  }

  if (checking) return null

  return (
    <main className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-burgundy-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-burgundy-400" aria-hidden />
          </div>
          <h1 className="font-serif text-2xl text-ivory-50 mb-1">Admin Login</h1>
          <p className="text-charcoal-400 text-sm">Sandhya Dresses Dashboard</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            autoComplete="current-password"
            className="bg-charcoal-800 border-charcoal-700 text-ivory-50 placeholder:text-charcoal-500"
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>
      </div>
    </main>
  )
}
