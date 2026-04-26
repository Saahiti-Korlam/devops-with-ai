"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../database/connection");
const router = express_1.default.Router();
exports.userRoutes = router;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const result = await (0, connection_1.query)('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1', [decoded.userId]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        const user = result.rows[0];
        const preferencesResult = await (0, connection_1.query)('SELECT * FROM user_preferences WHERE user_id = $1', [user.id]);
        const addressesResult = await (0, connection_1.query)('SELECT * FROM addresses WHERE user_id = $1', [user.id]);
        const response = {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                preferences: preferencesResult.rows[0] || {
                    currency: 'USD',
                    language: 'en',
                    newsletter: true,
                    promotions: true
                },
                addresses: addressesResult.rows,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to get profile' });
    }
});
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const { firstName, lastName } = req.body;
        await (0, connection_1.query)('UPDATE users SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [firstName, lastName, decoded.userId]);
        const result = await (0, connection_1.query)('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1', [decoded.userId]);
        const user = result.rows[0];
        const response = {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                preferences: {
                    currency: 'USD',
                    language: 'en',
                    newsletter: true,
                    promotions: true
                },
                addresses: [],
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});
router.post('/addresses', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const { street, city, state, zipCode, country, isDefault } = req.body;
        const result = await (0, connection_1.query)('INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [decoded.userId, street, city, state, zipCode, country, isDefault]);
        const response = {
            success: true,
            data: result.rows[0]
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ success: false, error: 'Failed to add address' });
    }
});
//# sourceMappingURL=users.js.map