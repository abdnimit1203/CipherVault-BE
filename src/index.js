"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const vaultRoutes_1 = __importDefault(require("./routes/vaultRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
// Basic Health Check Routes (placed first for instant response)
const healthHandler = (req, res) => {
    res.status(200).json({ status: 'success', message: 'CipherVault API is running.' });
};
app.get('/', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || origin.includes('netlify.app') || origin.includes('vercel.app') || origin.includes('localhost') || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Lazy Database Connection Middleware
app.use(async (req, res, next) => {
    try {
        await (0, db_1.default)();
    }
    catch (err) {
        console.error('Lazy DB connection error:', err);
    }
    next();
});
// Rate Limiting (configured safely for proxy / serverless environment)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false }
});
app.use('/api', limiter);
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/vault', vaultRoutes_1.default);
// Global Error Handler for Vercel Serverless
app.use((err, req, res, next) => {
    console.error('Unhandled API Error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
});
// Start Server in local dev
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    (0, db_1.default)().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}
exports.default = app;
