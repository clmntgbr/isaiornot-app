import type {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  Subscription,
  SubscriptionPreview,
} from "./types"

export const getSubscription = async (): Promise<Subscription | null> => {
  const response = await fetch("/api/subscription", {
    method: "GET",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Failed to fetch subscription")
  }

  const payload = (await response.json()) as
    | { data?: Subscription | null }
    | Subscription

  if ("data" in payload) {
    return payload.data ?? null
  }

  return payload as Subscription
}

export const previewSubscription = async (
  planId: string
): Promise<SubscriptionPreview> => {
  const response = await fetch("/api/subscriptions/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId }),
  })

  if (!response.ok) {
    throw new Error("Failed to preview subscription")
  }

  return response.json()
}

export const createSubscription = async (
  input: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> => {
  const response = await fetch("/api/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error("Failed to create subscription")
  }

  return response.json()
}

export const createBillingPortalSession =
  async (): Promise<CreateSubscriptionResponse> => {
    const response = await fetch("/api/subscriptions/portal", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to create billing portal session")
    }

    return response.json()
  }
