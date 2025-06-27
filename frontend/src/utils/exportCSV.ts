import { saveAs } from "file-saver";

export function exportToCSV<T>(data: T[], selectedColumns: (keyof T)[], filename = "report.csv") {
  const header = selectedColumns.join(",");
  const rows = data.map((row) =>
    selectedColumns.map((col) => JSON.stringify(row[col] ?? "")).join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}
