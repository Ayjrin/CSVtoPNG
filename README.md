# CSV to PNG Table Generator

A clean, modern microservice that converts CSV data to PNG table images with a minimalist UI and API.

## Features

- Upload CSV files via drag-and-drop or file selection
- Paste CSV text directly into a text area
- Preview table rendering with shadcn/ui components
- Generate and download table images as PNG
- API endpoint for headless rendering

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (based on Radix UI)
- **CSV Parsing**: PapaParse
- **Image Generation**: html-to-image (client-side), Puppeteer (server-side)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Usage

Send a POST request to `/api/generate` with a JSON body containing the CSV data:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"csvData": "name,role,status\nTony Reichert,CEO,Active\nZoey Lang,Technical Lead,Paused"}' \
  --output table.png
```

## Building for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy this application is to use the [Vercel Platform](https://vercel.com/new).

```bash
vercel
```
# CSVtoPNG
