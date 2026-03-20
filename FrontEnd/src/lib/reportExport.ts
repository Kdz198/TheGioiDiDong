import JSZip from "jszip";

export type CsvCell = string | number | boolean | null | undefined;

export interface CsvColumn<T extends object> {
  key: keyof T;
  header: string;
}

function escapeCsvCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function buildCsvContent<T extends object>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((column) => escapeCsvCell(row[column.key] as CsvCell)).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv<T extends object>(
  fileName: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void {
  const csvContent = buildCsvContent(rows, columns);
  // Add UTF-8 BOM to ensure Vietnamese characters render correctly in spreadsheet apps.
  const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(fileName, blob);
}

export async function downloadZipOfCsvFiles(
  zipName: string,
  files: Array<{
    fileName: string;
    csvContent: string;
  }>
): Promise<void> {
  const zip = new JSZip();
  files.forEach((file) => {
    zip.file(file.fileName, `\uFEFF${file.csvContent}`);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipName, blob);
}
