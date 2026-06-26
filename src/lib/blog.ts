import { marked } from "marked";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  cover?: string;
  tags: string[];
  published: string; // ISO date
  author?: string;
  readingTime: number; // minutes
}

export interface Post extends PostMeta {
  html: string;
  body: string;
}

// Eager-load all markdown posts at build time.
const RAW = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(src: string): { data: Record<string, unknown>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val: string = kv[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      data[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
      continue;
    }
    val = val.replace(/^['"]|['"]$/g, "");
    data[key] = val;
  }
  return { data, body: m[2] };
}

function toMeta(slug: string, data: Record<string, unknown>, body: string): PostMeta {
  const words = body.trim().split(/\s+/).length;
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    cover: data.cover ? String(data.cover) : undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    published: String(data.published ?? new Date().toISOString().slice(0, 10)),
    author: data.author ? String(data.author) : undefined,
    readingTime: Math.max(1, Math.round(words / 200)),
  };
}

const POSTS: Post[] = Object.entries(RAW)
  .map(([path, src]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data, body } = parseFrontmatter(src);
    const meta = toMeta(slug, data, body);
    const html = marked.parse(body, { async: false }) as string;
    return { ...meta, html, body };
  })
  .filter((p) => String((p as unknown as { published?: string }).published) !== "false")
  .sort((a, b) => (a.published < b.published ? 1 : -1));

export function listPosts(): PostMeta[] {
  return POSTS.map(({ html: _h, body: _b, ...rest }) => rest);
}

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function listTags(): string[] {
  return Array.from(new Set(POSTS.flatMap((p) => p.tags))).sort();
}

export function getPostsByTag(tag: string): PostMeta[] {
  return listPosts().filter((p) => p.tags.includes(tag));
}

export function getAdjacent(slug: string): { prev?: PostMeta; next?: PostMeta } {
  const idx = POSTS.findIndex((p) => p.slug === slug);
  if (idx < 0) return {};
  const prev = POSTS[idx + 1];
  const next = POSTS[idx - 1];
  return {
    prev: prev ? toMetaOnly(prev) : undefined,
    next: next ? toMetaOnly(next) : undefined,
  };
}

function toMetaOnly(p: Post): PostMeta {
  const { html: _h, body: _b, ...rest } = p;
  return rest;
}
