"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path = __importStar(require("path"));
(0, dotenv_1.config)();
let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl && databaseUrl.includes('postgresql+asyncpg://')) {
    databaseUrl = databaseUrl.replace('postgresql+asyncpg://', 'postgresql://');
}
let url;
let sslConfig = undefined;
try {
    url = new URL(databaseUrl);
    const sslMode = url.searchParams.get('sslmode');
    url.searchParams.delete('sslmode');
    if (sslMode === 'require') {
        sslConfig = {
            rejectUnauthorized: false,
        };
    }
}
catch (e) {
    throw new Error('Invalid DATABASE_URL');
}
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: url.toString(),
    entities: [path.join(__dirname, 'src', '**', '*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, 'src', 'migrations', '*.{.ts,.js}')],
    synchronize: false,
    logging: true,
    ...(sslConfig && { ssl: sslConfig }),
});
//# sourceMappingURL=data-source.js.map