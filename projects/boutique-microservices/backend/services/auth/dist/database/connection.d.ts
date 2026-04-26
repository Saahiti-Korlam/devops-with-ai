import { Pool } from 'pg';
export declare const connectDB: () => Promise<void>;
export declare const query: (text: string, params?: any[]) => Promise<any>;
export declare const getPool: () => Pool;
//# sourceMappingURL=connection.d.ts.map