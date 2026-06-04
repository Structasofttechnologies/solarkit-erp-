import app from '../index.js';
import connectDB from '../config/database.js';

export default async function handler(req, res) {
  // Ensure database connection is established
  await connectDB();
  
  // Forward request to Express app
  return app(req, res);
}
