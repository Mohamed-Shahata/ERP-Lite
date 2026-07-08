export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Exports rows as an .xls file (HTML table with the Excel MIME type — opens
 * directly in Excel/Sheets with no extra dependency). */
export function exportRowsToExcel<T>(
  filename: string,
  columns: ExportColumn<T>[],
  rows: T[],
) {
  const headerCells = columns.map((c) => `<th>${c.header}</th>`).join("");
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => `<td>${c.accessor(row)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  const html = `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  const blob = new Blob(["\uFEFF" + html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  downloadBlob(blob, `${filename}.xls`);
}

/** Opens a print-ready window styled as a simple report and triggers the
 * browser's print dialog, where the user can "Save as PDF". */
export function exportRowsToPdf<T>(
  title: string,
  columns: ExportColumn<T>[],
  rows: T[],
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const headerCells = columns.map((c) => `<th>${c.header}</th>`).join("");
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => `<td>${c.accessor(row)}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 18px; margin-bottom: 16px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: start; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>
        <script>window.onload = function () { window.print(); };</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
