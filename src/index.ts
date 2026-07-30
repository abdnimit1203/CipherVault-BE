import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import vaultRoutes from './routes/vaultRoutes';

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Basic Health Check Routes (placed first for instant response)
const healthHandler = (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'CipherVault API is running.' });
};

app.get('/', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('netlify.app') || origin.includes('vercel.app') || origin.includes('localhost') || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Lazy Database Connection Middleware
app.use(async (req: Request, res: Response, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Lazy DB connection error:', err);
  }
  next();
});

// Rate Limiting (configured safely for proxy / serverless environment)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);

// Global Error Handler for Vercel Serverless
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

// Start Server in local dev
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

export default app;
