export function isTypingTarget(el: EventTarget | Element | null): boolean {
  const target = el as HTMLElement | null;
  const tag = target?.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || !!target?.isContentEditable;
}
