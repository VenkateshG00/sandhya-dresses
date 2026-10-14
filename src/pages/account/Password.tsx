import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { customerChangePassword } from '@/lib/api'

export default function AccountPassword() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [validationError, setValidationError] = useState('')

  const mutation = useMutation({
    mutationFn: () => customerChangePassword({
      current_password: form.current_password,
      new_password: form.new_password,
    }),
    onSuccess: () => {
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError('')
    if (form.new_password.length < 8) {
      setValidationError('New password must be at least 8 characters')
      return
    }
    if (form.new_password !== form.confirm_password) {
      setValidationError('Passwords do not match')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              required
              minLength={8}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              placeholder="Min 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
          />
        </div>

        {(validationError || mutation.isError) && (
          <p className="text-sm text-red-600">
            {validationError || (mutation.error instanceof Error ? mutation.error.message : 'Failed to change password')}
          </p>
        )}

        {saved && (
          <p className="text-sm text-green-600">Password changed successfully!</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-6 py-2.5 bg-burgundy-700 text-white rounded-lg text-sm font-medium hover:bg-burgundy-800 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
