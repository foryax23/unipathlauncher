import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { searchCatalogue, type SearchHit } from "@/lib/search.functions";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, GraduationCap, Building2 } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const search = useServerFn(searchCatalogue);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      search({ data: { q: term, limit: 8 } })
        .then((r) => setHits(r.hits))
        .catch(() => setHits([]))
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(t);
  }, [q, search]);

  const go = useCallback(
    (h: SearchHit) => {
      setOpen(false);
      setQ("");
      if (h.kind === "course") {
        navigate({ to: "/courses/$slug", params: { slug: h.slug } });
      } else {
        navigate({ to: "/universities/$slug", params: { slug: h.slug } });
      }
    },
    [navigate],
  );

  const courses = hits.filter((h) => h.kind === "course");
  const unis = hits.filter((h) => h.kind === "university");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search courses and universities"
        className="tap inline-flex h-9 items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 text-xs text-muted-foreground transition hover:bg-accent/40"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="hidden md:inline rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search courses, universities, cities…"
          value={q}
          onValueChange={setQ}
        />
        <CommandList>
          {!loading && q.trim().length >= 2 && hits.length === 0 && (
            <CommandEmpty>No results for "{q}".</CommandEmpty>
          )}
          {q.trim().length < 2 && (
            <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
          )}
          {courses.length > 0 && (
            <CommandGroup heading="Courses">
              {courses.map((h) => (
                <CommandItem key={`c-${h.id}`} value={`c-${h.id}`} onSelect={() => go(h)}>
                  <GraduationCap className="mr-2 size-4 text-gold" />
                  <div className="flex flex-col">
                    <span className="text-sm">{h.title}</span>
                    <span className="text-xs text-muted-foreground">{h.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {courses.length > 0 && unis.length > 0 && <CommandSeparator />}
          {unis.length > 0 && (
            <CommandGroup heading="Universities">
              {unis.map((h) => (
                <CommandItem key={`u-${h.id}`} value={`u-${h.id}`} onSelect={() => go(h)}>
                  <Building2 className="mr-2 size-4 text-gold" />
                  <div className="flex flex-col">
                    <span className="text-sm">{h.title}</span>
                    <span className="text-xs text-muted-foreground">{h.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
