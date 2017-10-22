export function arrayWithContext(requireFn) {
  return requireFn.keys().map(requireFn).filter(Boolean);
}
