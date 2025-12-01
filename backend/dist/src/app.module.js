"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const database_config_1 = require("./config/database.config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const sessions_module_1 = require("./sessions/sessions.module");
const transcripts_module_1 = require("./transcripts/transcripts.module");
const clinical_module_1 = require("./clinical/clinical.module");
const soap_module_1 = require("./soap/soap.module");
const export_module_1 = require("./export/export.module");
const admin_module_1 = require("./admin/admin.module");
const realtime_module_1 = require("./realtime/realtime.module");
const patients_module_1 = require("./patients/patients.module");
const common_module_1 = require("./common/common.module");
const audit_module_1 = require("./audit/audit.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const encryption_service_1 = require("./common/encryption.service");
const typeorm_encrypt_transformer_1 = require("./common/typeorm-encrypt.transformer");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useClass: database_config_1.DatabaseConfig,
            }),
            common_module_1.CommonModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            sessions_module_1.SessionsModule,
            transcripts_module_1.TranscriptsModule,
            clinical_module_1.ClinicalModule,
            soap_module_1.SoapModule,
            export_module_1.ExportModule,
            admin_module_1.AdminModule,
            realtime_module_1.RealtimeModule,
            patients_module_1.PatientsModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: 'ENCRYPTION_SERVICE_INIT',
                useFactory: (encryptionService) => {
                    (0, typeorm_encrypt_transformer_1.setEncryptionService)(encryptionService);
                    return true;
                },
                inject: [encryption_service_1.EncryptionService],
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map