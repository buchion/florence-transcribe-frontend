"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoapModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const soap_controller_1 = require("./soap.controller");
const soap_service_1 = require("./soap.service");
const soap_note_entity_1 = require("./entities/soap-note.entity");
const clinical_extraction_entity_1 = require("../clinical/entities/clinical-extraction.entity");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
let SoapModule = class SoapModule {
};
exports.SoapModule = SoapModule;
exports.SoapModule = SoapModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([soap_note_entity_1.SOAPNote, clinical_extraction_entity_1.ClinicalExtraction]),
            subscriptions_module_1.SubscriptionsModule,
        ],
        controllers: [soap_controller_1.SoapController],
        providers: [soap_service_1.SoapService],
        exports: [soap_service_1.SoapService],
    })
], SoapModule);
//# sourceMappingURL=soap.module.js.map