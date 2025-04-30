// Simple script to test the API endpoint
const fetch = require('node-fetch');

async function testApi() {
  console.log('Starting API test...');
  
  try {
    // Sample CSV data
    const csvData = 'Name,Age,City\nJohn,30,New York\nJane,25,Los Angeles';
    const tableWidth = 800;
    
    console.log('Sending request to API...');
    console.log('Request URL:', 'http://localhost:3000/api/generate');
    console.log('Request payload:', { csvData: csvData.substring(0, 20) + '...', tableWidth });
    
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData, tableWidth }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      console.error('API request failed');
      const errorText = await response.text();
      console.error('Error response:', errorText);
    } else {
      const html = await response.text();
      console.log('API response received successfully');
      console.log('Response length:', html.length);
      console.log('Response preview:', html.substring(0, 100) + '...');
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();
