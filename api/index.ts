import app from '../src/index';
import connectDB from '../src/config/db';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (e) {
    console.error("DB connection error in serverless handler:", e);
  }
  return app(req, res);
}
