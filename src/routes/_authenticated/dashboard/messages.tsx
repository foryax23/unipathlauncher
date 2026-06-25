import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  listMyThreads,
  getThread,
  postMessage,
  startThread,
  markThreadRead,
} from "@/lib/threads.functions";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { DashShell } from "@/components/dashboard/DashShell";
import { Send, Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const threadsQuery = queryOptions({
  queryKey: ["threads"],
  queryFn: () => listMyThreads({}),
});

export const Route = createFileRoute("/_authenticated/dashboard/messages")({
  head: () => ({
    meta: [
      { title: "Messages · Bridge Gateway" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(threadsQuery),
  component: MessagesPage,
});

function MessagesPage() {
  const { data } = useSuspenseQuery(threadsQuery);
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(
    data.threads[0]?.id ?? null,
  );

  const start = useServerFn(startThread);
  const startMut = useMutation({
    mutationFn: (body: string) => start({ data: { body, subject: "New conversation" } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (res.thread?.id) setActiveId(res.thread.id);
      toast.success("Conversation started");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start"),
  });

  return (
    <DashShell eyebrow="Conversations" title="Messages">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="glass rounded-3xl p-3">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Threads</p>
            <button
              type="button"
              onClick={() => {
                const body = prompt("How can we help?");
                if (body && body.trim()) startMut.mutate(body.trim());
              }}
              className="tap rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/40"
              aria-label="New thread"
            >
              <Plus className="size-4" />
            </button>
          </div>
          {data.threads.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">
              No conversations yet. Tap + to message your adviser.
            </p>
          ) : (
            <ul className="mt-1 space-y-1">
              {data.threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={`tap w-full text-left rounded-2xl px-3 py-2 text-sm transition ${
                      activeId === t.id
                        ? "bg-gold/20 text-foreground"
                        : "hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <p className="truncate font-medium">{t.subject ?? "Conversation"}</p>
                    {t.last_message_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.last_message_at).toLocaleString()}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="glass-strong rounded-3xl min-h-[480px] flex flex-col">
          {activeId ? (
            <ThreadView threadId={activeId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <MessageSquare className="size-8 text-gold" />
              <p className="mt-3 font-serif text-2xl">Pick a thread</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Or start a new conversation with your adviser.
              </p>
            </div>
          )}
        </section>
      </div>
    </DashShell>
  );
}

function ThreadView({ threadId }: { threadId: string }) {
  const qc = useQueryClient();
  const [me, setMe] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const tq = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => getThread({ data: { id: threadId } }),
  });
  const messages = tq.data?.messages ?? [];

  useRealtimeMessages(threadId, () => {
    qc.invalidateQueries({ queryKey: ["thread", threadId] });
    qc.invalidateQueries({ queryKey: ["threads"] });
  });

  const markFn = useServerFn(markThreadRead);
  useEffect(() => {
    if (messages.length) {
      markFn({ data: { thread_id: threadId } }).catch(() => {});
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages.length, threadId, markFn]);

  const [text, setText] = useState("");
  const postFn = useServerFn(postMessage);
  const post = useMutation({
    mutationFn: () => postFn({ data: { thread_id: threadId, body: text.trim() } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["thread", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to send"),
  });

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map((m) => {
          const mine = m.sender_id === me;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  mine
                    ? "bg-gold text-gold-foreground rounded-br-md"
                    : "bg-background/70 border border-border rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-gold-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No messages yet. Say hi 👋
          </p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) post.mutate();
        }}
        className="border-t border-border p-3 flex items-end gap-2"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (text.trim()) post.mutate();
            }
          }}
          rows={1}
          maxLength={4000}
          placeholder="Type a message…"
          className="flex-1 resize-none rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <button
          type="submit"
          disabled={!text.trim() || post.isPending}
          className="tap inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90 transition disabled:opacity-60"
        >
          <Send className="size-4" />
        </button>
      </form>
    </>
  );
}
