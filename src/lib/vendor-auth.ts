'use client'

const API_BASE = '/api/vendors'

export async function vendorLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }))
    throw new Error(error.message || 'Login failed')
  }

  return response.json()
}

export async function vendorRegister(data: {
  email: string
  password: string
  name: string
  taxId: string
}) {
  const response = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }))
    throw new Error(error.message || 'Registration failed')
  }

  // After registration, automatically log in
  const vendor = await response.json()
  try {
    await vendorLogin(data.email, data.password)
  } catch (loginError) {
    // If auto-login fails, that's okay - user can log in manually
    console.warn('Auto-login after registration failed:', loginError)
  }
  
  return vendor
}

export async function vendorLogout() {
  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Logout failed')
  }
}

export async function getVendorMe() {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

