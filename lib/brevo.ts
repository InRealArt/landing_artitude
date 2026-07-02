const BREVO_API_URL = 'https://api.brevo.com/v3/contacts'

const LIST_IDS: Record<string, number> = {
  fr: 14,
  en: 17,
}

export async function addContactToBrevo(
  email: string,
  language: string,
  source: string = 'Website Newsletter Popup'
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error('BREVO_API_KEY not configured')

  const listId = LIST_IDS[language] ?? LIST_IDS.fr

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      updateEnabled: true,
      listIds: [listId],
      attributes: {
        LANGUAGE: language.toUpperCase(),
        SOURCE: source,
      },
    }),
  })

  if (res.status === 204 || res.status === 201 || res.status === 200) return

  const body = await res.json().catch(() => ({}))

  // duplicate_parameter means contact already exists — treat as success
  if (res.status === 400 && (body as { code?: string }).code === 'duplicate_parameter') return

  throw new Error((body as { message?: string }).message ?? `Brevo error ${res.status}`)
}
