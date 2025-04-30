import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csv-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvData } = body;

    if (!csvData) {
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 });
    }

    // Parse the CSV data
    const parsedData = parseCSV(csvData);
    if (parsedData.columns.length === 0 || parsedData.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid CSV data' }, { status: 400 });
    }

    // Generate HTML for the table
    const tableHtml = generateTableHtml(parsedData);

    // Return the HTML directly for client-side rendering
    return new NextResponse(tableHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating table HTML:', error);
    return NextResponse.json(
      { error: 'Failed to generate table HTML' },
      { status: 500 }
    );
  }
}

interface TableData {
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
}

function generateTableHtml(data: TableData) {
  const { columns, rows } = data;

  // Generate the table HTML
  const tableRows = rows.map((row: Record<string, string>) => {
    const cells = columns.map(
      (column: { key: string; label: string }) => `<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; word-break: break-word;">${row[column.key] || '-'}</td>`
    ).join('');
    return `<tr style="border-bottom: 1px solid #e5e7eb;">${cells}</tr>`;
  }).join('');

  const tableHeaders = columns.map(
    (column: { key: string; label: string }) => `<th style="padding: 12px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; white-space: nowrap;">${column.label}</th>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background-color: white; }
        .table-container { border: 1px solid #e5e7eb; background-color: white; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f5f5f5; }
        tr:hover { background-color: #f9fafb; }
      </style>
      <script>
        // This script will run when the page loads
        window.onload = function() {
          // Send a message to the parent window with the HTML content
          window.parent.postMessage({
            type: 'TABLE_HTML_READY',
            html: document.documentElement.outerHTML
          }, '*');
        };
      </script>
    </head>
    <body>
      <div class="table-container">
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}
