import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer } from '@/types'

interface CustomerState {
  customer: Customer | null
  role: 'customer' | 'admin' | null
  setCustomer: (customer: Customer, role: 'customer' | 'admin') => void
  clearCustomer: () => void
  isLoggedIn: () => boolean
  isAdmin: () => boolean
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customer: null,
      role: null,
      setCustomer: (customer, role) => set({ customer, role }),
      clearCustomer: () => set({ customer: null, role: null }),
      isLoggedIn: () => get().customer !== null || get().role === 'admin',
      isAdmin: () => get().role === 'admin',
    }),
    {
      name: 'sd-customer',
      partialize: (state) => ({ customer: state.customer, role: state.role }),
    },
  ),
)
