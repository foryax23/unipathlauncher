import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeMessages(threadId: string | null, onInsert: () => void) {
  useEffect(() => {
    if (!threadId) return;
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        () => onInsert(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, onInsert]);
}
