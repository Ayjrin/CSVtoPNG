# CSV to PNG Table Generator API

This document describes how to use the API endpoint to generate PNG images from CSV data programmatically.

## API Endpoint

```
POST /api/generate
```

## Request Format

Send a POST request with a JSON body containing the CSV data:

```json
{
  "csvData": "Your CSV data as a string"
}
```

Example:

```json
{
  "csvData": "Issue Title,Severity,Problem Description,Affected Area\nFragmented Tools and Integration Challenges,Moderate,\"There are issues with tools like HubSpot and FreshBooks not integrating properly, leading to duplicative entries and maintenance problems.\",Operational"
}
```

## Response

The API returns a PNG image with the following headers:

```
Content-Type: image/png
Content-Disposition: attachment; filename="table.png"
```

## Example Usage

### Using fetch in JavaScript

```javascript
const response = await fetch('https://your-domain.com/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    csvData: 'Issue Title,Severity,Problem Description,Affected Area\nFragmented Tools,Moderate,Description here,Operational' 
  }),
});

if (!response.ok) {
  throw new Error(`API request failed: ${response.status}`);
}

// Get the image data
const imageBlob = await response.blob();

// Create a URL for the image
const imageUrl = URL.createObjectURL(imageBlob);

// Display the image or download it
const img = document.createElement('img');
img.src = imageUrl;
document.body.appendChild(img);

// Or download it
const link = document.createElement('a');
link.href = imageUrl;
link.download = 'table.png';
link.click();
```

### Using curl

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"csvData":"Issue Title,Severity,Problem Description,Affected Area\nFragmented Tools,Moderate,Description here,Operational"}' \
  -o table.png \
  https://your-domain.com/api/generate
```

## Error Responses

If there's an error, the API will return a JSON response with an error message:

```json
{
  "error": "Error message"
}
```

Possible error status codes:
- 400: Bad Request (e.g., missing or invalid CSV data)
- 500: Internal Server Error

## Notes

- The API generates a clean table image with square corners (no rounded edges)
- The table styling matches the UI version of the application
- Long text in cells will wrap properly to ensure all content is visible
- The image is optimized for quality and readability
