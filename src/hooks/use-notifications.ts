import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyNotifications, markNotificationsRead } from "@/lib/notifications.functions";

export type AppNotification = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function useNotifications() {
  const fetchList = useServerFn(listMyNotifications);
  const markRead = useServerFn(markNotificationsRead);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    fetchList()
      .then((r) => {
        setItems(r.notifications as AppNotification[]);
        setUnread(r.unread);
      })
      .catch(() => {});
  }, [fetchList]);

  useEffect(() => {
    refresh();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      channel = supabase
        .channel(`notif:${uid}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
          () => refresh(),
        )
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [refresh]);

  const markAll = useCallback(async () => {
    await markRead({ data: {} });
    refresh();
  }, [markRead, refresh]);

  return { items, unread, refresh, markAll };
}
