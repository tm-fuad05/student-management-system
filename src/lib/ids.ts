export function nextNumericId(
  prefix: string,
  ids: string[],
  width = 3,
): string {
  const nums = ids
    .map((id) => {
      const m = id.match(new RegExp(`${prefix}(\\d+)`));
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(width, "0")}`;
}
