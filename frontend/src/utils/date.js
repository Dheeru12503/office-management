export function formatDate(value) {
  const datePart = typeof value === "string" ? value.slice(0, 10) : "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) return "";

  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}
