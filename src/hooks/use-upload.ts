import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { requestUploadUrl, confirmDocument } from "@/lib/documents.functions";

type DocType =
  | "passport"
  | "transcript"
  | "english_test"
  | "personal_statement"
  | "reference"
  | "other";

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const request = useServerFn(requestUploadUrl);
  const confirm = useServerFn(confirmDocument);

  async function upload(file: File, type: DocType) {
    setUploading(true);
    setProgress(0);
    try {
      const { path, signedUrl } = await request({
        data: {
          type,
          original_name: file.name,
          size_bytes: file.size,
          mime_type: file.type || "application/octet-stream",
        },
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      await confirm({
        data: {
          type,
          storage_path: path,
          original_name: file.name,
          size_bytes: file.size,
          mime_type: file.type || "application/octet-stream",
        },
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return { upload, uploading, progress };
}
