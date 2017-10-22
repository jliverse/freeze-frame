export function css() {
  return [...arguments].filter(Boolean).join(' ');
}
