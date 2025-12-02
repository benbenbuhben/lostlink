import dotenv from 'dotenv';
import app from './src/app.js';

dotenv.config();

const port = process.env.PORT || 5000;
const host = '0.0.0.0'; // Allow external connections

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log(`External access: http://192.168.254.29:5001`);
}); 