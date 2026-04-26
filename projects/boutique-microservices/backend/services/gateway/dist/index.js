"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = __importDefault(require("dotenv"));
const metrics_1 = require("./metrics");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.GATEWAY_PORT) || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
(0, metrics_1.setupMetrics)(app, { serviceName: 'gateway', serviceVersion: '1.0.0' });
app.use(metrics_1.metricsMiddleware);
const services = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003',
    orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3004',
    users: process.env.USERS_SERVICE_URL || 'http://localhost:3005',
};
app.use('/api/auth', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: services.auth,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
}));
app.use('/api/products', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: services.products,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '' },
}));
app.use('/api/orders', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: services.orders,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '' },
}));
app.use('/api/users', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: services.users,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' },
}));
app.use((req, res) => {
    res.status(404).json({ error: 'Service not found' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Proxying to services:`, services);
});
//# sourceMappingURL=index.js.map