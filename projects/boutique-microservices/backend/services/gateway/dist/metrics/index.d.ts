import { Counter, Histogram, Gauge, Registry } from 'prom-client';
export declare const register: Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const httpRequestDuration: Histogram<"method" | "route" | "status_code" | "service_name">;
export declare const httpRequestTotal: Counter<"method" | "route" | "status_code" | "service_name">;
export declare const httpRequestsInProgress: Gauge<"method" | "route" | "service_name">;
export declare const serviceInfo: Gauge<"service_name" | "version">;
export interface MetricsOptions {
    serviceName: string;
    serviceVersion?: string;
}
export declare function metricsMiddleware(req: any, res: any, next: any): void;
export declare function setupMetrics(app: any, options: MetricsOptions): void;
//# sourceMappingURL=index.d.ts.map