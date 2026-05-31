import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // getSession() resolves after detectSessionInUrl has processed the OAuth
    // callback hash, so we don't bounce while the session is being written.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) return;

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
