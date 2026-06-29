const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GMB token refresh failed: ${err}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function gmbFetch(
  url: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  const token = accessToken ?? (await getAccessToken())
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}
