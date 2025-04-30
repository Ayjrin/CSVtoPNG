import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'papaparse';

// Add config for Edge runtime
export const config = {
  runtime: 'edge'
};

export async function POST(request: NextRequest) {
  console.log('API route handler started');
  
  try {
    const body = await request.json();
    console.log('Request body received', { hasData: !!body.csvData, tableWidth: body.tableWidth });
    
    const { csvData, tableWidth = 800 } = body;

    if (!csvData) {
      console.log('Error: CSV data is missing');
      return NextResponse.json({ error: 'CSV data is required' }, { status: 400 });
    }

    // Parse the CSV data
    const parseResult = parse(csvData, { header: true });
    
    // Transform to expected format
    const parsedData = {
      columns: parseResult.meta.fields || [],
      rows: parseResult.data as Record<string, string>[]
    };
    if (parsedData.columns.length === 0 || parsedData.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid CSV data' }, { status: 400 });
    }

    // Generate HTML for the table
    const tableHtml = generateTableHtml(parsedData, tableWidth);

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
  columns: string[];
  rows: Record<string, string>[];
}

function generateTableHtml(data: TableData, tableWidth: number = 800) {
  const { columns, rows } = data;

  // Generate table headers
  const tableHeaders = columns.map(column => `<th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">${column}</th>`).join('');

  // Generate table rows
  const tableRows = rows.map(row => {
    const cells = columns.map(column => `<td style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">${row[column] || ''}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background-color: white; }
        .table-container { border: 1px solid #e5e7eb; background-color: white; width: ${tableWidth}px; }
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
