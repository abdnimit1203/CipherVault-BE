"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let isConnected = false;
const connectDB = async () => {
    if (isConnected || mongoose_1.default.connection.readyState >= 1) {
        isConnected = true;
        return;
    }
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('MONGO_URI or MONGODB_URI is not defined in environment variables');
            return;
        }
        const conn = await mongoose_1.default.connect(mongoUri, {
            family: 4, // Force IPv4
        });
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
};
exports.default = connectDB;
