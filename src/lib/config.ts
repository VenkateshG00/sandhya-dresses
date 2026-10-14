import { useQuery } from '@tanstack/react-query'
import { fetchConfig } from './api'
import type { SiteConfig } from '@/types'

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: fetchConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  })
}

export function getWhatsAppLink(config: SiteConfig | undefined, message?: string): string | null {
  const number = config?.store_whatsapp?.replace(/\D/g, '')
  if (!number || number.length < 10) return null

  // Ensure international format without +
  const intl = number.startsWith('91') ? number : `91${number}`
  const url = `https://wa.me/${intl}`
  return message ? `${url}?text=${encodeURIComponent(message)}` : url
}

export function getPhoneLink(config: SiteConfig | undefined): string | null {
  const phone = config?.store_phone?.replace(/\s/g, '')
  if (!phone) return null
  return `tel:${phone}`
}

export function getFullAddress(config: SiteConfig | undefined): string {
  if (!config) return 'Near Union Bank, Elabaka Road, Challur, Veenavanka Mandal, Karimnagar District, Telangana 505505'
  return [
    config.store_address_line1,
    config.store_address_line2,
    config.store_address_city,
    config.store_address_state,
    config.store_address_pin,
  ]
    .filter(Boolean)
    .join(', ')
}
