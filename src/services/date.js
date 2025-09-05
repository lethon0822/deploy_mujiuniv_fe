export const fmt2 = (n) => String(n).padStart(2, '0');
export const ymd = (d) =>
  `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;

export const expandDates = (start, end) => {
  const out = [];
  let cur = new Date(start);
  const e = new Date(end);
  while (cur <= e) {
    out.push(ymd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};