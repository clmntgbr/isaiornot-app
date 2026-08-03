"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const pathname = usePathname()

  if (pathname.startsWith("/account/setup")) {
    return null
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 p-4">
      <SignedOut>
        <>
          <SignInButton forceRedirectUrl="/" fallbackRedirectUrl="/" />
          <SignUpButton
            forceRedirectUrl="/account/setup"
            fallbackRedirectUrl="/account/setup"
          >
            <button className="h-10 cursor-pointer rounded-full bg-purple-700 px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
              Sign Up
            </button>
          </SignUpButton>
        </>
      </SignedOut>
      <SignedIn>
        <Link href="/">
          <Button variant="ghost">Accueil</Button>
        </Link>
        <Link href="/pricing">
          <Button variant="ghost">Pricing</Button>
        </Link>
        <Link href="/subscription">
          <Button variant="ghost">Abonnement</Button>
        </Link>
        <ModeToggle />
        <UserButton />
        <SignOutButton />
      </SignedIn>
    </header>
  )
}
