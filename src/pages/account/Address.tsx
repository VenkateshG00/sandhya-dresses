import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import {
  customerGetAddresses,
  customerAddAddress,
  customerUpdateAddress,
  customerDeleteAddress,
} from '@/lib/api'
import type { CustomerAddress } from '@/types'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli','Daman & Diu','Delhi','Jammu & Kashmir','Lakshadweep','Ladakh','Puducherry',
]

type FormData = Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at'>

const emptyForm: FormData = {
  label: 'Home',
  line1: '',
  line2: '',
  city: '',
  state: 'Telangana',
  pin: '',
  country: 'India',
  is_default: 0,
}

export default function AccountAddress() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  const { data: addresses = [], isLoading } = useQuery<CustomerAddress[]>({
    queryKey: ['customer-addresses'],
    queryFn: customerGetAddresses,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId !== null) {
        await customerUpdateAddress(editId, form)
      } else {
        await customerAddAddress(form)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] })
      setShowForm(false)
      setEditId(null)
      setForm(emptyForm)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerDeleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-addresses'] }),
  })

  function startEdit(addr: CustomerAddress) {
    setForm({
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      pin: addr.pin,
      country: addr.country,
      is_default: addr.is_default,
    })
    setEditId(addr.id)
    setShowForm(true)
  }

  function startAdd() {
    setForm(emptyForm)
    setEditId(null)
    setShowForm(true)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
        {!showForm && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1 text-sm text-burgundy-700 hover:text-burgundy-900 font-medium"
          >
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{editId ? 'Edit Address' : 'New Address'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
              <select
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              >
                {['Home', 'Work', 'Other'].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
              <input
                type="text"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              >
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PIN Code</label>
              <input
                type="text"
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value })}
                required
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="is_default"
                checked={form.is_default === 1}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked ? 1 : 0 })}
                className="rounded text-burgundy-600"
              />
              <label htmlFor="is_default" className="text-sm text-gray-700">Set as default</label>
            </div>

            {saveMutation.isError && (
              <p className="col-span-2 text-sm text-red-600">
                {saveMutation.error instanceof Error ? saveMutation.error.message : 'Failed to save'}
              </p>
            )}

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-4 py-2 bg-burgundy-700 text-white rounded-lg text-sm font-medium hover:bg-burgundy-800 disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving…' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null) }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No saved addresses yet.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className={`p-4 rounded-xl border ${addr.is_default ? 'border-burgundy-300 bg-burgundy-50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700 uppercase">{addr.label}</span>
                    {addr.is_default === 1 && (
                      <span className="text-xs text-burgundy-700 font-medium">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                    {addr.city}, {addr.state} — {addr.pin}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(addr)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(addr.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
