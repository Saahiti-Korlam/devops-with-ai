"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = require("../database/connection");
const router = express_1.default.Router();
exports.productRoutes = router;
router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '12', sortBy = 'created_at', category, search, minPrice, maxPrice } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        let whereClause = 'WHERE 1=1';
        const filterParams = [];
        let paramIndex = 1;
        if (category) {
            whereClause += ' AND c.name = $' + paramIndex;
            filterParams.push(category);
            paramIndex++;
        }
        if (search) {
            whereClause += ' AND (p.name ILIKE $' + paramIndex + ' OR p.description ILIKE $' + (paramIndex + 1) + ')';
            filterParams.push(`%${search}%`, `%${search}%`);
            paramIndex += 2;
        }
        if (minPrice) {
            whereClause += ' AND p.price >= $' + paramIndex;
            filterParams.push(minPrice);
            paramIndex++;
        }
        if (maxPrice) {
            whereClause += ' AND p.price <= $' + paramIndex;
            filterParams.push(maxPrice);
            paramIndex++;
        }
        const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`;
        const productsQuery = `
      SELECT p.id, p.name, p.description, p.price, p.compare_price, 
             p.brand, p.inventory_quantity, p.is_featured, p.created_at, p.updated_at,
             COALESCE(c.name, 'Uncategorized') as category,
             CASE 
               WHEN p.name ILIKE '%gown%' OR p.name ILIKE '%dress%' THEN '/product-images/silk-evening-gown.jpg'
               WHEN p.name ILIKE '%coat%' OR p.name ILIKE '%cashmere%' THEN '/product-images/cashmere-coat.jpg'
               WHEN p.name ILIKE '%handbag%' OR p.name ILIKE '%bag%' THEN '/product-images/leather-handbag.jpg'
               WHEN p.name ILIKE '%necklace%' OR p.name ILIKE '%jewelry%' THEN '/product-images/diamond-necklace.jpg'
               WHEN p.name ILIKE '%heels%' OR p.name ILIKE '%shoes%' THEN '/product-images/designer-heels.jpg'
               ELSE '/product-images/placeholder.jpg'
             END as image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        const allParams = [...filterParams, limitNum, offset];
        const [countResult, productsResult] = await Promise.all([
            (0, connection_1.query)(countQuery, filterParams),
            (0, connection_1.query)(productsQuery, allParams)
        ]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limitNum);
        const response = {
            success: true,
            data: {
                products: productsResult.rows,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    total,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get products error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        res.status(500).json({ success: false, error: 'Failed to get products', details: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, connection_1.query)(`
      SELECT p.id, p.name, p.description, p.price, p.compare_price, 
             p.brand, p.inventory_quantity, p.is_featured, p.created_at, p.updated_at,
             COALESCE(c.name, 'Uncategorized') as category,
             CASE 
               WHEN p.name ILIKE '%gown%' OR p.name ILIKE '%dress%' THEN '/product-images/silk-evening-gown.jpg'
               WHEN p.name ILIKE '%coat%' OR p.name ILIKE '%cashmere%' THEN '/product-images/cashmere-coat.jpg'
               WHEN p.name ILIKE '%handbag%' OR p.name ILIKE '%bag%' THEN '/product-images/leather-handbag.jpg'
               WHEN p.name ILIKE '%necklace%' OR p.name ILIKE '%jewelry%' THEN '/product-images/diamond-necklace.jpg'
               WHEN p.name ILIKE '%heels%' OR p.name ILIKE '%shoes%' THEN '/product-images/designer-heels.jpg'
               ELSE '/product-images/placeholder.jpg'
             END as image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        const response = {
            success: true,
            data: result.rows[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, error: 'Failed to get product' });
    }
});
router.get('/categories', async (req, res) => {
    try {
        const result = await (0, connection_1.query)(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.name = p.category 
      GROUP BY c.id, c.name, c.description, c.image_url
      ORDER BY c.name
    `);
        const response = {
            success: true,
            data: result.rows
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, error: 'Failed to get categories' });
    }
});
//# sourceMappingURL=products.js.map