export function asLong(date) {
  const d = date || new Date();
  return (
    d.getFullYear() * 10000000000000 +
    (d.getMonth() + 1) * 100000000000 +
    d.getDate() * 1000000000 +
    d.getHours() * 10000000 +
    d.getMinutes() * 100000 +
    d.getSeconds() * 1000 +
    d.getMilliseconds() * 1
  );
}
