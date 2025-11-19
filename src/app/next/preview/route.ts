import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySignedToken } from '@/lib/signedToken'

export const GET = async (req: Request): Promise<Response> => {
  console.log('Requesting preview...')
  const { searchParams } = new URL(req.url)
  const pathname = searchParams.get('pathname')
  const token = searchParams.get('token')

  if (!pathname || !token) {
    return new Response('Pathname and token parameters are required.', { status: 400 })
  }

  const isValidToken = verifySignedToken({
    token,
    scope: 'preview',
  })

  if (!isValidToken) {
    return new Response('Invalid or expired preview token', { status: 403 })
  }

  if (!pathname.startsWith('/')) {
    return new Response('Pathname must start with /', { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(pathname)
}
