import { Button } from "@/components/ui/button"
import type { UploadFile } from "@/lib/mock-upload"
import { cn } from "@/lib/utils"
import { CloudUpload, FileVideo, ImageIcon, Send, X } from "lucide-react"
import { useCallback, useRef, useState } from "react"

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void
  pendingFiles?: UploadFile[]
  onSend?: () => void
  onCancel?: () => void
  isSending?: boolean
}

const ACCEPT =
  ".jpg,.jpeg,.png,.webp,.mp4,.mov,image/jpeg,image/png,image/webp,video/mp4,video/quicktime"

export function UploadDropzone({
  onFiles,
  pendingFiles = [],
  onSend,
  onCancel,
  isSending = false,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setDragging(false)
      const dropped = Array.from(e.dataTransfer.files)
      if (dropped.length) onFiles(dropped)
    },
    [onFiles]
  )

  const hasPending = pendingFiles.length > 0

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="File drop zone"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        dragCounter.current++
        setDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        dragCounter.current--
        if (dragCounter.current <= 0) setDragging(false)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "group relative flex h-80 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-3 border-dashed px-6 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-96",
        dragging
          ? "scale-[1.01] border-primary bg-accent shadow-lg"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      {hasPending && !dragging ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {pendingFiles.slice(0, 6).map((item) => {
              const isVideo = item.file.type.startsWith("video/")

              return (
                <div
                  key={item.id}
                  className="flex size-24 items-center justify-center overflow-hidden rounded-xl border bg-secondary shadow-sm"
                >
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={`Preview of ${item.file.name}`}
                      className="size-full object-cover"
                    />
                  ) : isVideo ? (
                    <FileVideo
                      className="size-8 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : (
                    <ImageIcon
                      className="size-8 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            })}
            {pendingFiles.length > 6 && (
              <div className="flex size-24 items-center justify-center rounded-xl border bg-secondary text-sm font-medium text-muted-foreground">
                +{pendingFiles.length - 6}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              size="lg"
              disabled={isSending}
              className="cursor-pointer gap-2"
              onClick={(e) => {
                e.stopPropagation()
                onSend?.()
              }}
            >
              <Send className="size-4" aria-hidden="true" />
              Send
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSending}
              className="cursor-pointer gap-2"
              onClick={(e) => {
                e.stopPropagation()
                onCancel?.()
              }}
            >
              <X className="size-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-full transition-colors",
              dragging
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-primary"
            )}
          >
            <CloudUpload className="size-8" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              {dragging
                ? "Drop your files here!"
                : "Drop your image or video here"}
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, WebP, MP4 or MOV — 100 MB max per file, multiple files
              accepted
            </p>
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? [])
          if (selected.length) onFiles(selected)
          e.target.value = ""
        }}
      />
    </div>
  )
}
