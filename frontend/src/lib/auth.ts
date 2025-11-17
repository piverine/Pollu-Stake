import { PortalRole } from '@/types'

export const getPortalRoleFromPath = (pathname?: string | null): PortalRole | null => {
  if (!pathname) return null
  if (pathname.startsWith('/admin')) {
    return 'admin'
  }
  if (pathname.startsWith('/factory')) {
    return 'factory'
  }
  return null
}

export const parseUserPortalRole = (value: unknown): PortalRole | null => {
  if (value === 'admin' || value === 'factory') {
    return value
  }
  return null
}
