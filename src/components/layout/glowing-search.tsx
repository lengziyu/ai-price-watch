"use client";

import { SearchIcon } from "lucide-react";

export function GlowingSearch() {
  return (
    <label className="search-glow group/search" aria-label="搜索站内内容">
      <span className="search-glow__halo" />
      <span className="search-glow__rim search-glow__rim--wide" />
      <span className="search-glow__rim search-glow__rim--soft" />
      <span className="search-glow__rim search-glow__rim--line" />
      <span className="search-glow__body">
        <SearchIcon className="pointer-events-none size-4 text-muted-foreground transition-colors group-focus-within/search:text-primary group-hover/search:text-primary" />
        <input
          className="search-glow__input"
          name="site-search"
          placeholder="搜索"
          type="search"
        />
        <span className="search-glow__shortcut">⌘K</span>
      </span>
    </label>
  );
}
