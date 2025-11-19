import { createHmac } from 'crypto'

interface TokenPayload {
  exp: number
  scope?: string
}

// Type for expiresIn parameter - string with time unit or number for seconds
export type ExpiresIn =
  | `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`
  | `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`
  | number

export interface GenerateSignedTokenOptions {
  secret?: string
  expiresIn?: ExpiresIn
  scope?: string
}

export interface VerifySignedTokenOptions {
  token: string
  secret?: string
  scope?: string
}

/**
 * Parse expiresIn value to milliseconds
 */
function parseExpiresIn(expiresIn: ExpiresIn): number {
  // If it's a number, treat as seconds
  if (typeof expiresIn === 'number') {
    return expiresIn * 1000
  }

  // Parse string format
  const match = expiresIn.match(/^(\d+)\s*(ms|s|m|h|d)$/)
  if (!match) {
    throw new Error(
      `Invalid expiresIn format: ${expiresIn}. Use formats like '5m', '1h', '30s', '7d', '100ms' or a number for seconds`,
    )
  }

  const value = parseInt(match[1]!, 10)
  const unit = match[2]!

  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return value * multipliers[unit]!
}

/**
 * Generate a signed token with configurable expiry and optional scope
 */
export function generateSignedToken(options: GenerateSignedTokenOptions = {}): string {
  const { expiresIn = '5m', scope } = options

  // Use provided secret or fall back to PAYLOAD_SECRET
  const secret = options.secret || process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('No secret provided and PAYLOAD_SECRET environment variable is not set')
  }

  const expiryMs = parseExpiresIn(expiresIn)

  const payload: TokenPayload = {
    exp: Date.now() + expiryMs,
    ...(scope && { scope }),
  }

  const data = JSON.stringify(payload)
  const signature = createHmac('sha256', secret).update(data).digest('hex')

  // Create token: base64(payload).signature
  const token = `${Buffer.from(data).toString('base64')}.${signature}`
  return token
}

/**
 * Verify a signed token is valid, not expired, and matches the optional scope
 */
export function verifySignedToken(options: VerifySignedTokenOptions): boolean {
  const { token, scope } = options

  // Use provided secret or fall back to PAYLOAD_SECRET
  const secret = options.secret || process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('No secret provided and PAYLOAD_SECRET environment variable is not set')
  }

  try {
    const [encodedPayload, signature] = token.split('.')
    if (!encodedPayload || !signature) return false

    const data = Buffer.from(encodedPayload, 'base64').toString()
    const expectedSignature = createHmac('sha256', secret).update(data).digest('hex')

    // Verify signature
    if (signature !== expectedSignature) return false

    const payload: TokenPayload = JSON.parse(data)

    // Check expiry
    if (Date.now() > payload.exp) return false

    // Check scope if provided
    if (scope && payload.scope !== scope) return false

    return true
  } catch {
    return false
  }
}
