import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
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

    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the content and wait for it to load
    await page.setContent(tableHtml, { waitUntil: 'networkidle0' });
    
    // Wait for the table to be fully rendered
    await page.waitForSelector('.table-container');
    
    // Get the table container element
    const tableElement = await page.$('.table-container');
    if (!tableElement) {
      throw new Error('Table element not found');
    }
    
    // Take a screenshot of just the table element
    const screenshot = await tableElement.screenshot({ 
      type: 'png',
      omitBackground: false
    });

    // Close the browser
    await browser.close();

    // Return the image
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="table.png"',
      },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
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
