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

export interface ExportSection<T = unknown> {
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
}

function sectionTableHtml<T>(section: ExportSection<T>): string {
  const headerCells = section.columns
    .map((c) => `<th>${c.header}</th>`)
    .join("");
  const bodyRows = section.rows.length
    ? section.rows
        .map(
          (row) =>
            `<tr>${section.columns
              .map((c) => `<td>${c.accessor(row)}</td>`)
              .join("")}</tr>`,
        )
        .join("")
    : `<tr><td colspan="${section.columns.length}">—</td></tr>`;
  return `<h2>${section.title} (${section.rows.length})</h2><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

/** Exports several tables (one per data type) into a single .xls workbook
 * page, stacked with headings between them. */
export function exportSectionsToExcel(
  filename: string,
  sections: ExportSection<never>[],
) {
  const html = sections.map((s) => sectionTableHtml(s)).join("<br/>");
  const blob = new Blob(["\uFEFF" + html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  downloadBlob(blob, `${filename}.xls`);
}

/** Opens a print-ready window with every section's table, styled and
 * paginated, ready for "Save as PDF". */
export function exportSectionsToPdf(
  title: string,
  sections: ExportSection<never>[],
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const body = sections.map((s) => sectionTableHtml(s)).join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 20px; margin-bottom: 20px; }
          h2 { font-size: 14px; margin: 24px 0 8px; page-break-after: avoid; }
          table { border-collapse: collapse; width: 100%; font-size: 11px; margin-bottom: 12px; page-break-inside: auto; }
          tr { page-break-inside: avoid; }
          th, td { border: 1px solid #e2e8f0; padding: 5px 8px; text-align: start; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${body}
        <script>window.onload = function () { window.print(); };</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
