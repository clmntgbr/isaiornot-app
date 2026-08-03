import { AccountShell } from "@/components/account-shell"
import { UserProvider } from "@/lib/user/provider"

export const dynamic = "force-dynamic"

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserProvider>
      <AccountShell>{children}</AccountShell>
    </UserProvider>
  )
}
