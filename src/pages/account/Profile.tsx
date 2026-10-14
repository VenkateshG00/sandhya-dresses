import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerGetProfile, customerUpdateProfile } from '@/lib/api'
import { useCustomerStore } from '@/lib/customerStore'
import type { Customer } from '@/types'

export default function AccountProfile() {
  const { setCustomer, role } = useCustomerStore()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })

  const { data: profile, isLoading } = useQuery<Customer>({
    queryKey: ['customer-profile'],
    queryFn: customerGetProfile,
  })

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone ?? '' })
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: () => customerUpdateProfile({
      name: form.name,
      ...(form.phone ? { phone: form.phone } : {}),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
      if (profile && role) {
        setCustomer({ ...profile, name: form.name, phone: form.phone || null }, role)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
        className="space-y-4 max-w-md"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profile?.email ?? ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
            placeholder="+91 98765 43210"
          />
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to save'}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-6 py-2.5 bg-burgundy-700 text-white rounded-lg text-sm font-medium hover:bg-burgundy-800 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
