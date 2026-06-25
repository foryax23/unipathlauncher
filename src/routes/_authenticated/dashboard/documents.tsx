import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import {
  listMyDocuments,
  deleteDocument,
  getDocumentDownloadUrl,
} from "@/lib/documents.functions";
import { DashShell } from "@/components/dashboard/DashShell";
import { useUpload } from "@/hooks/use-upload";
import { Download, Trash2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

const docsQuery = queryOptions({
  queryKey: ["documents"],
  queryFn: () => listMyDocuments({}),
});

const TYPES = [
  { value: "passport", label: "Passport / ID" },
  { value: "transcript", label: "Transcript" },
  { value: "english_test", label: "English test" },
  { value: "personal_statement", label: "Personal statement" },
  { value: "reference", label: "Reference letter" },
  { value: "other", label: "Other" },
] as const;

export const Route = createFileRoute("/_authenticated/dashboard/documents")({
  head: () => ({
    meta: [
      { title: "Documents · Bridge Gateway" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(docsQuery),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data } = useSuspenseQuery(docsQuery);
  const qc = useQueryClient();
  const { upload, uploading, progress } = useUpload();
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("passport");
  const fileRef = useRef<HTMLInputElement>(null);

  const delFn = useServerFn(deleteDocument);
  const dlFn = useServerFn(getDocumentDownloadUrl);

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload(file, type);
      toast.success("Uploaded");
      qc.invalidateQueries({ queryKey: ["documents"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDownload(id: string) {
    try {
      const { url } = await dlFn({ data: { id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download");
    }
  }

  return (
    <DashShell eyebrow="Vault" title="Your documents">
      <div className="glass-strong rounded-3xl p-6">
        <p className="font-serif text-xl">Upload a document</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Stored privately. Only you and your adviser can see it. Max 25&nbsp;MB per file.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <label className="tap inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 transition">
            <Upload className="size-4" />
            {uploading ? `Uploading ${progress}%` : "Choose file"}
            <input
              ref={fileRef}
              type="file"
              hidden
              disabled={uploading}
              onChange={handleFile}
            />
          </label>
        </div>
      </div>

      <h2 className="mt-8 font-serif text-xl">Saved files ({data.documents.length})</h2>
      {data.documents.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {data.documents.map((d) => (
            <li key={d.id} className="glass rounded-3xl p-5 flex items-center gap-3">
              <FileText className="size-6 text-gold shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{d.original_name}</p>
                <p className="text-xs text-muted-foreground">
                  {TYPES.find((t) => t.value === d.type)?.label ?? d.type} ·{" "}
                  {Math.round((d.size_bytes ?? 0) / 1024)} KB ·{" "}
                  {new Date(d.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(d.id)}
                className="tap rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent/40"
                aria-label="Download"
              >
                <Download className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => { if (confirm("Delete this file?")) del.mutate(d.id); }}
                className="tap rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </DashShell>
  );
}
