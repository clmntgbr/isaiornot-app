export function getBackendApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_BACKEND_API_URL

  if (!url) {
    throw new Error("Missing BACKEND_API_URL or NEXT_PUBLIC_BACKEND_API_URL")
  }

  return url.replace("://localhost", "://127.0.0.1")
}
