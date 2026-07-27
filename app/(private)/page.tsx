"use client"

import { ScanItem } from "@/components/scan-item"
import { EmptyComponent } from "@/components/empty"
import { Header } from "@/components/header"
import { StatCard } from "@/components/statistic-card"
import { UploadDropzone } from "@/components/upload-dropzone"
import { useScan } from "@/lib/scan/context"
import {
  createUploadFiles,
  revokeUploadFilePreviews,
  type UploadFile,
} from "@/lib/mock-upload"
import { useStatistics } from "@/lib/statistics/context"
import { Bot, ImageIcon, Images, ShieldCheck, TrendingUp } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

export default function Page() {
  const { scans, uploadFile } = useScan()
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

      <section className="animate-fade-in grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Images}
          label="Scans"
          value={String(statistics?.scansCount ?? 0)}
          color="text-primary"
        />
        <StatCard
          icon={ShieldCheck}
          label="Réelles"
          value={String(statistics?.realImageCount ?? 0)}
          color="text-success"
        />
        <StatCard
          icon={Bot}
          label="Générées IA"
          value={String(statistics?.aiImageCount ?? 0)}
          color="text-destructive"
        />
        <StatCard
          icon={TrendingUp}
          label="Score moyen"
          value={statistics ? statistics.averageScore.toFixed(1) : "—"}
          color="text-warning"
        />
      </section>

      <section className="flex flex-col gap-4">
        {scans.members.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {scans.members.map((scan) => (
              <li key={scan.id}>
                <ScanItem item={scan} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyComponent
            title="Aucune analyse"
            description="Dépose un fichier pour lancer une première analyse."
            icon={<ImageIcon className="size-5 text-muted-foreground" />}
          />
        )}
      </section>
    </div>
  )
}
