import { ScanProvider } from "@/lib/scan/provider"
import { UserCentrifugeListener } from "@/lib/centrifugo/user-centrifuge-listener"
import { PlanProvider } from "@/lib/plan/provider"
import { StatisticsProvider } from "@/lib/statistics/provider"
import { SubscriptionProvider } from "@/lib/subscription/provider"
import { UserProvider } from "@/lib/user/provider"

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PlanProvider>
      <UserProvider>
        <SubscriptionProvider>
          <ScanProvider>
            <StatisticsProvider>
              <UserCentrifugeListener />
              <div className="mx-auto bg-background px-0">{children}</div>
            </StatisticsProvider>
          </ScanProvider>
        </SubscriptionProvider>
      </UserProvider>
    </PlanProvider>
  )
}
