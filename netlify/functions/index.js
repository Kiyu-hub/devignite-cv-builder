// Netlify serverless function wrapper
import { createServer } from 'http';

export async function handler(event, context) {
  // Import the built server
  const serverModule = await import('../../dist/index.js');
  
  // Return a simple response for now to test deployment
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      message: 'Devignite CV Builder API',
      status: 'running'
    }),
  };
}
