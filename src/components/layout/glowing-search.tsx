"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRightIcon, SearchIcon } from "lucide-react";

import { siteSearchEntries } from "@/data/site-search";
import { cn } from "@/lib/utils";

export function GlowingSearch({ className }: { className?: string }) {
  const router = useRouter();
  const rootRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const keyword = deferredQuery.trim().toLowerCase();
  const quickLinks = siteSearchEntries.slice(0, 6);
  const results = (keyword ? siteSearchEntries : quickLinks)
    .filter((item) => {
      if (!keyword) {
        return true;
      }

      return [item.title, item.description, ...item.keywords]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    })
    .slice(0, 7);
  const normalizedActiveIndex = results.length
    ? Math.min(Math.max(activeIndex, 0), results.length - 1)
    : -1;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openItem = (href: string) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <label
      ref={rootRef}
      className={cn("search-glow group/search", className)}
      aria-label="搜索站内内容"
    >
      <span className="search-glow__halo" />
      <span className="search-glow__rim search-glow__rim--wide" />
      <span className="search-glow__rim search-glow__rim--soft" />
      <span className="search-glow__rim search-glow__rim--line" />
      <span className="search-glow__body">
        <SearchIcon className="pointer-events-none size-4 text-muted-foreground transition-colors group-focus-within/search:text-primary group-hover/search:text-primary" />
        <input
          ref={inputRef}
          className="search-glow__input"
          name="site-search"
          placeholder="搜索页面、厂商、场景"
          type="search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && results.length) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                current < 0 ? 0 : (current + 1) % results.length,
              );
              return;
            }

            if (event.key === "ArrowUp" && results.length) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                current <= 0 ? results.length - 1 : current - 1,
              );
              return;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              const targetResult =
                results[normalizedActiveIndex] ?? results[0];

              if (targetResult) {
                openItem(targetResult.href);
              }
            }
          }}
        />
        <span className="search-glow__shortcut">⌘K</span>
      </span>

      {open ? (
        <span className="search-glow__panel" role="listbox" aria-label="搜索结果">
          <span className="search-glow__panel-title">
            {keyword ? `找到 ${results.length} 个结果` : "快捷入口"}
          </span>
          {results.length ? (
            results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "search-glow__result",
                  normalizedActiveIndex === index && "is-active",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openItem(item.href)}
              >
                <span className="search-glow__result-copy">
                  <span className="search-glow__result-title">{item.title}</span>
                  <span className="search-glow__result-desc">{item.description}</span>
                </span>
                <span className="search-glow__result-meta">
                  <span className="search-glow__result-kind">{item.section}</span>
                  <ArrowUpRightIcon className="size-3.5" />
                </span>
              </button>
            ))
          ) : (
            <span className="search-glow__empty">
              没找到匹配项，试试搜索 Token、Claude、Copilot、学习研究。
            </span>
          )}
        </span>
      ) : null}
    </label>
  );
}
