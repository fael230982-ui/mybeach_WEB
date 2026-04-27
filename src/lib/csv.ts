export function csvField(value: string | number | null | undefined) {
  const safe = String(value ?? "").replace(/"/g, '""');
  return `"${safe}"`;
}

export function buildCsvContent(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  return [headers.join(","), ...rows.map((row) => row.map(csvField).join(","))].join("\n");
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  // Prefix with UTF-8 BOM so spreadsheet apps preserve accents on open.
  const blob = new Blob(["\uFEFF", buildCsvContent(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
