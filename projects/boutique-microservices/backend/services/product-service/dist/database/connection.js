"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = exports.query = exports.connectDB = void 0;
const pg_1 = require("pg");
let pool;
const connectDB = async () => {
    try {
        // Use DATABASE_URL if available, otherwise fall back to individual env vars
        const databaseUrl = process.env.DATABASE_URL;
        if (databaseUrl) {
            pool = new pg_1.Pool({
                connectionString: databaseUrl,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
        }
        else {
            pool = new pg_1.Pool({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'products_db',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
        }
        await pool.query('SELECT NOW()');
        console.log('Connected to PostgreSQL database for product service');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
const query = (text, params) => {
    if (!pool) {
        throw new Error('Database not connected');
    }
    return pool.query(text, params);
};
exports.query = query;
const getPool = () => {
    if (!pool) {
        throw new Error('Database not connected');
    }
    return pool;
};
exports.getPool = getPool;
//# sourceMappingURL=connection.js.map