"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patients_service_1 = require("./patients.service");
const patients_controller_1 = require("./patients.controller");
const patients_migration_1 = require("./patients.migration");
const patient_entity_1 = require("./entities/patient.entity");
const session_entity_1 = require("../sessions/entities/session.entity");
const user_entity_1 = require("../users/entities/user.entity");
const common_module_1 = require("../common/common.module");
const audit_module_1 = require("../audit/audit.module");
let PatientsModule = class PatientsModule {
};
exports.PatientsModule = PatientsModule;
exports.PatientsModule = PatientsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([patient_entity_1.Patient, session_entity_1.Session, user_entity_1.User]),
            common_module_1.CommonModule,
            audit_module_1.AuditModule,
        ],
        controllers: [patients_controller_1.PatientsController],
        providers: [patients_service_1.PatientsService, patients_migration_1.PatientsMigrationService],
        exports: [patients_service_1.PatientsService],
    })
], PatientsModule);
//# sourceMappingURL=patients.module.js.map