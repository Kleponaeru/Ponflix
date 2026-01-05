export function parseIndoTimeAgo(text) {
  if (!text) return "-";

  const lower = text.toLowerCase();

  const match = lower.match(/(\d+)\s+(menit|jam|hari|minggu|bulan|tahun)/);
  if (!match) return text;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const map = {
    menit: "minute",
    jam: "hour",
    hari: "day",
    minggu: "week",
    bulan: "month",
    tahun: "year",
  };

  const enUnit = map[unit];
  if (!enUnit) return text;

  return `${value} ${enUnit}${value > 1 ? "s" : ""} ago`;
}
