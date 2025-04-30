// Simple script to test the API endpoint
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function testApiEndpoint() {
  try {
    // Sample CSV data
    const csvData = `Issue Title,Severity,Problem Description,Affected Area
Fragmented Tools and Integration Challenges,Moderate,"There are issues with tools like HubSpot and FreshBooks not integrating properly, leading to duplicative entries and maintenance problems. This affects billing and account management.","Operational and Client"
Lack of Integration Between Monday.com and FreshBooks,Critical,"The lack of integration between Monday.com and FreshBooks requires manual entry of project numbers, leading to significant administrative inefficiencies and potential budget overruns.",Operational
Duplication of Work Between Brandfolder and Google Drive,Moderate,"There is duplication of work due to the lack of integration between Brandfolder and Google Drive, leading to inefficiencies in file management.",Operational`;

    // Call the API endpoint
    const response = await fetch('http://localhost:3002/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    // Get the image data
    const imageBuffer = await response.buffer();

    // Save the image to a file
    const outputPath = path.join(__dirname, 'api-test-output.png');
    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`Image saved to ${outputPath}`);
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApiEndpoint();
