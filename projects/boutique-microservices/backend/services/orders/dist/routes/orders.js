"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const connection_1 = require("../database/connection");
const router = express_1.default.Router();
exports.orderRoutes = router;
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003';
router.post('/', async (req, res) => {
    try {
        // Demo mode - use a fixed user ID or get from request
        const { items, shippingAddress, userId = 'demo-user-id' } = req.body;
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const productResponse = await axios_1.default.get(`${PRODUCTS_SERVICE_URL}/${item.productId}`);
            const product = productResponse.data.data;
            totalAmount += product.price * item.quantity;
            orderItems.push({
                product_id: item.productId,
                quantity: item.quantity,
                price: product.price
            });
        }
        const result = await (0, connection_1.query)(`
      INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [userId, totalAmount, 'pending', JSON.stringify(shippingAddress), 'pending']);
        const order = result.rows[0];
        const insertedItems = [];
        for (const item of orderItems) {
            const itemResult = await (0, connection_1.query)(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [order.id, item.product_id, item.quantity, item.price]);
            insertedItems.push({ ...item, id: itemResult.rows[0].id });
        }
        const response = {
            success: true,
            data: {
                id: order.id,
                userId: order.user_id,
                items: insertedItems.map(item => ({
                    id: item.id,
                    orderId: order.id,
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: order.total_amount,
                status: order.status,
                shippingAddress: shippingAddress,
                paymentStatus: order.payment_status,
                createdAt: order.created_at,
                updatedAt: order.updated_at
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});
router.get('/my-orders', async (req, res) => {
    try {
        // Demo mode - use a fixed user ID or get from query
        const userId = req.query.userId || 'demo-user-id';
        const result = await (0, connection_1.query)(`
      SELECT o.*,
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.user_id, o.total_amount, o.status, o.shipping_address, o.payment_status, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `, [userId]);
        const response = {
            success: true,
            data: result.rows
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, error: 'Failed to get orders' });
    }
});
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        await (0, connection_1.query)('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
        const result = await (0, connection_1.query)('SELECT * FROM orders WHERE id = $1', [id]);
        const response = {
            success: true,
            data: result.rows[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
});
//# sourceMappingURL=orders.js.map