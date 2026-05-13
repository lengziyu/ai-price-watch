"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const stickyTabsEvent = "page-tabs-sticky-change";

export function useStickyTabs(
  owner: string,
  { offset = 12, enabled = true }: { offset?: number; enabled?: boolean } = {},
) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const stickySentinelRef = useRef<HTMLDivElement>(null);
  const stickyBoundaryRef = useRef<HTMLElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  const evaluateSticky = useCallback(() => {
    if (!enabled) {
      setIsSticky((current) => (current ? false : current));
      window.dispatchEvent(
        new CustomEvent(stickyTabsEvent, {
          detail: {
            active: false,
            headerProgress: 0,
            owner,
          },
        }),
      );
      return;
    }

    const node = stickyRef.current;
    const sentinel = stickySentinelRef.current;
    if (!node) {
      return;
    }
    if (!sentinel) {
      return;
    }

    const limit = offset;
    const sentinelRect = sentinel.getBoundingClientRect();
    const boundaryNode = stickyBoundaryRef.current ?? node.parentElement;
    const containerRect = boundaryNode?.getBoundingClientRect();
    const stickyRect = node.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const stickyHeight = node.offsetHeight || stickyRect.height;
    const stickyStart = sentinelRect.top + scrollTop - limit;
    const stickyEnd =
      (containerRect?.bottom ?? Number.POSITIVE_INFINITY) +
      scrollTop -
      limit -
      stickyHeight -
      16;
    const headerFadeStart = stickyStart - 80;
    const headerHideAt = stickyStart - 30;
    const headerProgress =
      scrollTop < headerFadeStart || scrollTop > stickyEnd
        ? 0
        : scrollTop >= headerHideAt
          ? 1
          : (scrollTop - headerFadeStart) / 50;
    const hysteresis = 18;

    setIsSticky((current) => {
      const nextSticky = current
        ? scrollTop >= stickyStart - hysteresis &&
          scrollTop <= stickyEnd + hysteresis
        : scrollTop >= stickyStart && scrollTop <= stickyEnd;

      return current === nextSticky ? current : nextSticky;
    });

    window.dispatchEvent(
      new CustomEvent(stickyTabsEvent, {
        detail: {
          active: scrollTop >= stickyStart && scrollTop <= stickyEnd,
          headerProgress: Math.max(0, Math.min(1, headerProgress)),
          owner,
        },
      }),
    );
  }, [enabled, offset, owner]);

  const scrollToStickyContent = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (!enabled) {
        return;
      }

      const sentinel = stickySentinelRef.current;
      const node = stickyRef.current;

      if (!sentinel || !node) {
        return;
      }

      const scrollTop = window.scrollY || window.pageYOffset;
      const targetTop = sentinel.getBoundingClientRect().top + scrollTop - offset + 1;

      if (scrollTop + 2 < targetTop) {
        return;
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior,
          });
        });
      });
    },
    [enabled, offset],
  );

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(evaluateSticky);
    };

    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [evaluateSticky]);

  useEffect(() => {
    if (!enabled) {
      window.dispatchEvent(
        new CustomEvent(stickyTabsEvent, {
          detail: {
            active: false,
            headerProgress: 0,
            owner,
          },
        }),
      );
      return;
    }

    window.dispatchEvent(
      new CustomEvent(stickyTabsEvent, {
        detail: {
          active: isSticky,
          headerProgress: isSticky ? 1 : 0,
          owner,
        },
      }),
    );
  }, [enabled, isSticky, owner]);

  useEffect(
    () => () => {
      window.dispatchEvent(
        new CustomEvent(stickyTabsEvent, {
          detail: {
            active: false,
            headerProgress: 0,
            owner,
          },
        }),
      );
    },
    [owner],
  );

  return {
    stickyRef,
    stickySentinelRef,
    stickyBoundaryRef,
    isSticky,
    scrollToStickyContent,
  };
}

export { stickyTabsEvent };
