"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceInfo = exports.httpRequestsInProgress = exports.httpRequestTotal = exports.httpRequestDuration = exports.register = void 0;
exports.metricsMiddleware = metricsMiddleware;
exports.setupMetrics = setupMetrics;
const prom_client_1 = require("prom-client");
exports.register = new prom_client_1.Registry();
(0, prom_client_1.collectDefaultMetrics)({ register: exports.register });
exports.httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code', 'service_name'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [exports.register],
});
exports.httpRequestTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'service_name'],
    registers: [exports.register],
});
exports.httpRequestsInProgress = new prom_client_1.Gauge({
    name: 'http_requests_in_progress',
    help: 'Number of HTTP requests in progress',
    labelNames: ['method', 'route', 'service_name'],
    registers: [exports.register],
});
exports.serviceInfo = new prom_client_1.Gauge({
    name: 'service_info',
    help: 'Static information about service',
    labelNames: ['service_name', 'version'],
    registers: [exports.register],
});
function metricsMiddleware(req, res, next) {
    const start = Date.now();
    const route = req.route?.path || req.path || 'unknown';
    const serviceName = req.app.get('serviceName') || 'unknown';
    exports.httpRequestsInProgress.inc({ method: req.method, route, service_name: serviceName }, 1);
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const statusCode = res.statusCode.toString();
        exports.httpRequestDuration.observe({ method: req.method, route, status_code: statusCode, service_name: serviceName }, duration);
        exports.httpRequestTotal.inc({ method: req.method, route, status_code: statusCode, service_name: serviceName }, 1);
        exports.httpRequestsInProgress.dec({ method: req.method, route, service_name: serviceName }, 1);
    });
    next();
}
function setupMetrics(app, options) {
    const { serviceName, serviceVersion = '1.0.0' } = options;
    app.set('serviceName', serviceName);
    exports.serviceInfo.set({ service_name: serviceName, version: serviceVersion }, 1);
    app.get('/metrics', async (req, res) => {
        res.set('Content-Type', exports.register.contentType);
        res.end(await exports.register.metrics());
    });
    app.get('/health', (req, res) => {
        res.json({ status: `${serviceName} is healthy`, timestamp: new Date().toISOString() });
    });
}
//# sourceMappingURL=index.js.map