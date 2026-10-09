/** Sliding windows overlap to keep visible cards stable while scrolling in either direction. */
export function kanbanWindowOffset(first: number, offset: number, total: number, pageSize: number, down: boolean) {
  const step = Math.max(1, Math.floor(pageSize / 2));
  let target = offset;
  if (first < offset || first >= offset + pageSize) target = Math.floor(first / step) * step;
  else if (down && first >= offset + step) target += step;
  else if (!down && first <= offset + 1) target -= step;
  return Math.min(Math.max(0, target), Math.max(0, total - pageSize));
}
