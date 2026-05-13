"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

const activeSelector = [
  '[data-segmented-active="true"]',
  "[data-active]",
  '[data-state="active"]',
  '[aria-selected="true"]',
].join(",");

export function useSegmentedIndicator<T extends HTMLElement>() {
  const rootRef = useRef<T>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  const updateIndicator = useCallback(() => {
    const root = rootRef.current;
    const indicator = indicatorRef.current;

    if (!root || !indicator) {
      return;
    }

    const activeItem = root.querySelector<HTMLElement>(activeSelector);

    if (!activeItem) {
      indicator.style.opacity = "0";
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    indicator.style.width = `${itemRect.width}px`;
    indicator.style.height = `${itemRect.height}px`;
    indicator.style.transform = `translate3d(${itemRect.left - rootRect.left + root.scrollLeft}px, ${itemRect.top - rootRect.top + root.scrollTop}px, 0)`;
    indicator.style.borderRadius = getComputedStyle(activeItem).borderRadius;
    indicator.style.opacity = "1";
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      updateIndicator();
      frame = requestAnimationFrame(updateIndicator);
    };

    updateIndicator();
    schedule();

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);
    Array.from(root.children).forEach((child) => resizeObserver.observe(child));

    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "data-segmented-active",
        "data-active",
        "data-state",
        "aria-selected",
        "class",
        "style",
      ],
    });

    root.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      root.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [updateIndicator]);

  return {
    segmentedRef: rootRef,
    indicatorRef,
    updateIndicator,
  };
}
