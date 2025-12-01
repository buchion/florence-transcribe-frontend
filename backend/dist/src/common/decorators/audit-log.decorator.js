"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = exports.AUDIT_LOG_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_LOG_KEY = 'audit_log';
const AuditLog = (metadata) => (0, common_1.SetMetadata)(exports.AUDIT_LOG_KEY, metadata);
exports.AuditLog = AuditLog;
//# sourceMappingURL=audit-log.decorator.js.map