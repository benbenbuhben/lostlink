// CRITICAL: Load .env BEFORE any other imports
// ES modules hoist imports, so we need to load env vars first
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file with explicit path - MUST be before any other imports
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading .env:', result.error);
  } else {
    console.log('✅ Loaded .env file from:', envPath);
    console.log('✅ Environment variables loaded:', Object.keys(result.parsed || {}).length, 'variables');
  }
} else {
  console.warn('⚠️ .env file not found at:', envPath);
  dotenv.config(); // Fallback to default location
}

// Now import app (this will import other modules that need env vars)
import app from './src/app.js';

const port = process.env.PORT || 5000;
const host = '0.0.0.0'; // Allow external connections

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`External access: http://192.168.254.29:5001`);
}); 