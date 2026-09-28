"use client";

import { ArrowUp, Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  disabled: boolean;
  onText: (text: string) => void;
  onPhoto: (file: File, caption: string) => Promise<void>;
}

export function Composer({ disabled, onText, onPhoto }: Props) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onText(value);
    setText("");
  }

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await onPhoto(file, text.trim());
      setText("");
    } finally {
      setUploading(false);
    }
  }

  const busy = disabled || uploading;

  return (
    <form onSubmit={submit} className="px-3 pb-3 pt-2">
      <div className="flex items-center gap-1 rounded-full border border-line bg-canvas p-1 pl-1.5 shadow-[0_8px_24px_-12px_rgb(11_11_18/0.15)]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-ink disabled:opacity-50"
          aria-label="Прикрепить фото"
          title="Прикрепить фото"
        >
          {uploading ? <Spinner className="h-4 w-4" /> : <Paperclip size={18} strokeWidth={1.75} />}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={pickFile} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение"
          maxLength={1000}
          className="h-9 min-w-0 flex-1 bg-transparent px-1 text-[14.5px] outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition disabled:bg-line disabled:text-muted"
          aria-label="Отправить"
        >
          <ArrowUp size={18} strokeWidth={2} />
        </button>
      </div>
    </form>
  );
}
