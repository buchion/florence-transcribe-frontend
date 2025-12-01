"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transcripts_service_1 = require("./transcripts.service");
const transcripts_controller_1 = require("./transcripts.controller");
const transcript_entity_1 = require("./entities/transcript.entity");
const auth_module_1 = require("../auth/auth.module");
const common_module_1 = require("../common/common.module");
const audit_module_1 = require("../audit/audit.module");
const sessions_module_1 = require("../sessions/sessions.module");
const patients_module_1 = require("../patients/patients.module");
let TranscriptsModule = class TranscriptsModule {
};
exports.TranscriptsModule = TranscriptsModule;
exports.TranscriptsModule = TranscriptsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([transcript_entity_1.Transcript]),
            auth_module_1.AuthModule,
            common_module_1.CommonModule,
            audit_module_1.AuditModule,
            (0, common_1.forwardRef)(() => sessions_module_1.SessionsModule),
            patients_module_1.PatientsModule,
        ],
        controllers: [transcripts_controller_1.TranscriptsController],
        providers: [transcripts_service_1.TranscriptsService],
        exports: [transcripts_service_1.TranscriptsService],
    })
], TranscriptsModule);
//# sourceMappingURL=transcripts.module.js.map