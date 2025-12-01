"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FhirMapperService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let FhirMapperService = class FhirMapperService {
    mapToFhirBundle(extraction, patientId, practitionerId) {
        const bundleId = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        const entries = [];
        if (extraction.problems) {
            for (const problem of extraction.problems) {
                const condition = this.createCondition(problem, patientId, practitionerId, timestamp);
                entries.push({
                    fullUrl: `urn:uuid:${(0, uuid_1.v4)()}`,
                    resource: condition,
                });
            }
        }
        if (extraction.medications) {
            for (const medication of extraction.medications) {
                const medRequest = this.createMedicationRequest(medication, patientId, practitionerId, timestamp);
                entries.push({
                    fullUrl: `urn:uuid:${(0, uuid_1.v4)()}`,
                    resource: medRequest,
                });
            }
        }
        if (extraction.vitals) {
            for (const vital of extraction.vitals) {
                const observation = this.createObservation(vital, patientId, practitionerId, timestamp);
                entries.push({
                    fullUrl: `urn:uuid:${(0, uuid_1.v4)()}`,
                    resource: observation,
                });
            }
        }
        if (extraction.orders) {
            for (const order of extraction.orders) {
                const serviceRequest = this.createServiceRequest(order, patientId, practitionerId, timestamp);
                entries.push({
                    fullUrl: `urn:uuid:${(0, uuid_1.v4)()}`,
                    resource: serviceRequest,
                });
            }
        }
        return {
            resourceType: 'Bundle',
            id: bundleId,
            type: 'transaction',
            timestamp,
            entry: entries,
        };
    }
    createCondition(problem, patientId, practitionerId, timestamp) {
        const coding = [];
        if (problem.icd10_code) {
            coding.push({
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                code: problem.icd10_code,
                display: problem.description,
            });
        }
        return {
            resourceType: 'Condition',
            id: (0, uuid_1.v4)(),
            clinicalStatus: {
                coding: [
                    {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active',
                    },
                ],
            },
            verificationStatus: {
                coding: [
                    {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                        code: 'confirmed',
                        display: 'Confirmed',
                    },
                ],
            },
            category: [
                {
                    coding: [
                        {
                            system: 'http://snomed.info/sct',
                            code: '439401001',
                            display: 'Diagnosis',
                        },
                    ],
                },
            ],
            code: {
                coding,
                text: problem.description,
            },
            subject: {
                reference: `Patient/${patientId}`,
            },
            recorder: {
                reference: `Practitioner/${practitionerId}`,
            },
            recordedDate: timestamp,
        };
    }
    createMedicationRequest(medication, patientId, practitionerId, timestamp) {
        const dosageInstruction = [];
        if (medication.dosage || medication.frequency) {
            dosageInstruction.push({
                text: `${medication.dosage || ''} ${medication.frequency || ''}`.trim(),
                route: medication.route
                    ? {
                        coding: [
                            {
                                system: 'http://snomed.info/sct',
                                code: this.mapRouteToSnomed(medication.route),
                                display: medication.route,
                            },
                        ],
                    }
                    : undefined,
            });
        }
        return {
            resourceType: 'MedicationRequest',
            id: (0, uuid_1.v4)(),
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
                text: medication.normalized_name || medication.name,
            },
            subject: {
                reference: `Patient/${patientId}`,
            },
            requester: {
                reference: `Practitioner/${practitionerId}`,
            },
            dosageInstruction,
            authoredOn: timestamp,
        };
    }
    createObservation(vital, patientId, practitionerId, timestamp) {
        return {
            resourceType: 'Observation',
            id: (0, uuid_1.v4)(),
            status: 'final',
            code: {
                text: vital.type,
            },
            subject: {
                reference: `Patient/${patientId}`,
            },
            performer: [
                {
                    reference: `Practitioner/${practitionerId}`,
                },
            ],
            valueString: vital.value,
            effectiveDateTime: timestamp,
        };
    }
    createServiceRequest(order, patientId, practitionerId, timestamp) {
        const coding = [];
        if (order.cpt_code) {
            coding.push({
                system: 'http://www.ama-assn.org/go/cpt',
                code: order.cpt_code,
                display: order.description,
            });
        }
        return {
            resourceType: 'ServiceRequest',
            id: (0, uuid_1.v4)(),
            status: 'active',
            intent: 'order',
            code: {
                coding,
                text: order.description,
            },
            subject: {
                reference: `Patient/${patientId}`,
            },
            requester: {
                reference: `Practitioner/${practitionerId}`,
            },
            authoredOn: timestamp,
        };
    }
    mapRouteToSnomed(route) {
        const routeMap = {
            oral: '26643006',
            intravenous: '47625008',
            intramuscular: '78421000',
            subcutaneous: '34206005',
            topical: '6064005',
        };
        return routeMap[route?.toLowerCase()] || '26643006';
    }
};
exports.FhirMapperService = FhirMapperService;
exports.FhirMapperService = FhirMapperService = __decorate([
    (0, common_1.Injectable)()
], FhirMapperService);
//# sourceMappingURL=fhir-mapper.service.js.map