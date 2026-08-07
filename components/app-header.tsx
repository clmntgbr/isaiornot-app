"use client"

import { openSubscriptionDrawer } from "@/components/subscription-drawer-host"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useAuth()

  if (
    pathname.startsWith("/account/setup") ||
    pathname.startsWith("/subscription/success") ||
    pathname.startsWith("/subscription/cancel")
  ) {
    return null
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 p-4">
      <nav className="mr-auto flex items-center gap-1">
        <Link href="/">
          <Button variant={pathname === "/" ? "secondary" : "ghost"}>
            Home
          </Button>
        </Link>
        <Link href="/pricing">
          <Button
            variant={pathname.startsWith("/pricing") ? "secondary" : "ghost"}
          >
            Pricing
          </Button>
        </Link>
        {isLoaded && isSignedIn ? (
          <Button variant="ghost" onClick={openSubscriptionDrawer}>
            Subscription
          </Button>
        ) : null}
      </nav>

      <ModeToggle />

      {!isLoaded ? (
        <div className="size-8 animate-pulse rounded-full bg-muted" />
      ) : (
        <>
          <SignedOut>
            <SignInButton forceRedirectUrl="/" fallbackRedirectUrl="/">
              <Button variant="outline">Sign in</Button>
            </SignInButton>
            <SignUpButton
              forceRedirectUrl="/account/setup"
              fallbackRedirectUrl="/account/setup"
            >
              <Button>Create account</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
            <SignOutButton>
              <Button variant="ghost">Sign out</Button>
            </SignOutButton>
          </SignedIn>
        </>
      )}
    </header>
  )
}
