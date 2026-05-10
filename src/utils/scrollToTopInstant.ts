/** Scroll viewport to top immediately after programmatic route changes. */
export function scrollToTopInstant(): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant" as ScrollBehavior,
  });
}
