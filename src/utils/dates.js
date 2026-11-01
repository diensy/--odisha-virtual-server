const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DAY = '(\\d{1,2})(?:st|nd|rd|th)?';
const YEAR = '(?:,?\\s*(\\d{4}))?';

export const todayIstIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const valid = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

/** Without a year, a date that has already passed this year means next year. */
function withYear(m, d, y, today) {
  if (y) return valid(y, m, d) ? iso(y, m, d) : null;
  const year = Number(today.slice(0, 4));
  const candidate = iso(year, m, d);
  if (!valid(year, m, d)) return null;
  return candidate < today ? (valid(year + 1, m, d) ? iso(year + 1, m, d) : null) : candidate;
}

const monthNum = (s) => MONTHS.indexOf(s.slice(0, 3).toLowerCase()) + 1;

/**
 * Finds calendar dates in free text, in the order they appear, as YYYY-MM-DD.
 * Handles "2026-12-01", "01/12/2026" (day first), "15 October", "October 15th, 2026",
 * "15 to 19 October", "today" and "tomorrow".
 */
export function extractDates(text, today = todayIstIso()) {
  const found = [];
  const add = (index, value) => value && found.push({ index, value });
  const t = text.toLowerCase();
  let m;

  for (m of t.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) add(m.index, withYear(+m[2], +m[3], +m[1], today));
  for (m of t.matchAll(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/g)) add(m.index, withYear(+m[2], +m[1], +m[3], today));

  // "15 to 19 october": the first day borrows the month that follows.
  for (m of t.matchAll(new RegExp(`\\b${DAY}\\s*(?:-|–|to|till|until)\\s*${DAY}\\s+${MONTH}${YEAR}`, 'g'))) {
    const month = monthNum(m[3]);
    const year = m[4] ? Number(m[4]) : null;
    add(m.index, withYear(month, +m[1], year, today));
    add(m.index + 1, withYear(month, +m[2], year, today));
  }
  for (m of t.matchAll(new RegExp(`\\b${DAY}\\s+(?:of\\s+)?${MONTH}${YEAR}\\b`, 'g'))) {
    if (!found.some((f) => Math.abs(f.index - m.index) < 12)) add(m.index, withYear(monthNum(m[2]), +m[1], m[3] ? +m[3] : null, today));
  }
  for (m of t.matchAll(new RegExp(`\\b${MONTH}\\s+${DAY}${YEAR}\\b`, 'g'))) add(m.index, withYear(monthNum(m[1]), +m[2], m[3] ? +m[3] : null, today));

  const shift = (days) => {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  for (m of t.matchAll(/\btoday\b/g)) add(m.index, today);
  for (m of t.matchAll(/(?<!after )\btomorrow\b/g)) add(m.index, shift(1));
  for (m of t.matchAll(/\bday after tomorrow\b/g)) add(m.index, shift(2));

  const seen = new Set();
  return found
    .sort((a, b) => a.index - b.index)
    .map((f) => f.value)
    .filter((v) => (seen.has(v) ? false : seen.add(v)));
}
