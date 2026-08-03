"use client"

import { EmptyComponent } from "@/components/empty"
import { Header } from "@/components/header"
import { ScansFilters } from "@/components/scans-filters"
import { ScansPagination } from "@/components/scans-pagination"
import { ScanItem } from "@/components/scan-item"
import { StatCard } from "@/components/statistic-card"
import { Button } from "@/components/ui/button"
import { UploadDropzone } from "@/components/upload-dropzone"
import { useScan } from "@/lib/scan/context"
import type { ScanFilters as ScanFiltersState } from "@/lib/scan/types"
import {
  createUploadFiles,
  revokeUploadFilePreviews,
  type UploadFile,
} from "@/lib/mock-upload"
import { useStatistics } from "@/lib/statistics/context"
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs"
import { Bot, ImageIcon, Images, ShieldCheck, TrendingUp } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

export default function Page() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  if (!isSignedIn) {
    return <GuestHome />
  }

  return <AuthenticatedHome />
}

function GuestHome() {
  return (
    <div className="container mx-auto flex max-w-6xl flex-col gap-8 p-4">
      <Header />
      <div className="flex h-80 flex-col items-center justify-center gap-5 rounded-2xl border-3 border-dashed border-border bg-card px-6 text-center sm:h-96">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ImageIcon className="size-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="font-display text-lg font-semibold">
            Analyze your first image
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Create an account to upload your media and run AI detection.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <SignInButton forceRedirectUrl="/" fallbackRedirectUrl="/">
            <Button variant="outline">Sign in</Button>
          </SignInButton>
          <SignUpButton
            forceRedirectUrl="/account/setup"
            fallbackRedirectUrl="/account/setup"
          >
            <Button>Create account</Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  )
}

function AuthenticatedHome() {
  const { scans, filters, isScansLoading, fetchScans, setFilters, uploadFile } =
    useScan()
  const { statistics } = useStatistics()
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([])
  const [isSending, setIsSending] = useState(false)
  const pendingFilesRef = useRef(pendingFiles)

  pendingFilesRef.current = pendingFiles

  useEffect(() => {
    return () => {
      revokeUploadFilePreviews(pendingFilesRef.current)
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    setPendingFiles((current) => [...current, ...createUploadFiles(files)])
  }, [])

  const handleSend = useCallback(async () => {
    if (!pendingFiles.length || isSending) return

    setIsSending(true)

    try {
      for (const item of pendingFiles) {
        await uploadFile(item.file)
      }

      revokeUploadFilePreviews(pendingFiles)
      setPendingFiles([])
    } finally {
      setIsSending(false)
    }
  }, [isSending, pendingFiles, uploadFile])

  const handleCancel = useCallback(() => {
    if (isSending) return

    revokeUploadFilePreviews(pendingFiles)
    setPendingFiles([])
  }, [isSending, pendingFiles])

  const handlePageChange = useCallback(
    (page: number) => {
      void fetchScans(page)
    },
    [fetchScans]
  )

  const handleFiltersChange = useCallback(
    (next: ScanFiltersState) => {
      void setFilters(next)
    },
    [setFilters]
  )

  const hasFilters = Boolean(
    filters.verdict || filters.confidence || filters.status
  )

  return (
    <div className="container mx-auto flex max-w-6xl flex-col gap-8 p-4">
      <Header />
      <UploadDropzone
        onFiles={handleFiles}
        pendingFiles={pendingFiles}
        onSend={handleSend}
        onCancel={handleCancel}
        isSending={isSending}
      />

      <section className="mb-4 grid animate-fade-in grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Images}
          label="Scans"
          value={String(statistics?.scansCount ?? 0)}
          color="text-primary"
        />
        <StatCard
          icon={ShieldCheck}
          label="Real"
          value={String(statistics?.realImageCount ?? 0)}
          color="text-success"
        />
        <StatCard
          icon={Bot}
          label="AI-generated"
          value={String(statistics?.aiImageCount ?? 0)}
          color="text-destructive"
        />
        <StatCard
          icon={TrendingUp}
          label="Average score"
          value={statistics ? statistics.averageScore.toFixed(1) : "—"}
          color="text-warning"
        />
      </section>

      <section className="flex flex-col gap-4">
        <ScansFilters
          filters={filters}
          onChange={handleFiltersChange}
          disabled={isScansLoading}
        />

        {scans.members.length > 0 ? (
          <>
            <ul className="flex flex-col gap-3">
              {scans.members.map((scan) => (
                <li key={scan.id}>
                  <ScanItem item={scan} />
                </li>
              ))}
            </ul>
            <ScansPagination
              page={scans.page}
              totalPages={scans.totalPages}
              onPageChange={handlePageChange}
              disabled={isScansLoading}
            />
          </>
        ) : (
          <EmptyComponent
            title={hasFilters ? "No results" : "No analyses yet"}
            description={
              hasFilters
                ? "No scans match these filters. Try broadening your selection."
                : "Drop a file to run your first analysis."
            }
            icon={<ImageIcon className="size-5 text-muted-foreground" />}
          />
        )}
      </section>
    </div>
  )
}
