"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedactionService = void 0;
const common_1 = require("@nestjs/common");
let RedactionService = class RedactionService {
    constructor() {
        this.patterns = {
            ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
            phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            date: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
            creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
            zipCode: /\b\d{5}(-\d{4})?\b/g,
        };
    }
    redactText(text, options) {
        if (!text) {
            return { redactedText: '', redactedItems: [] };
        }
        let redactedText = text;
        const redactedItems = [];
        const opts = {
            redactNames: true,
            redactDates: false,
            redactPhone: true,
            redactEmail: true,
            redactSSN: true,
            redactAddress: false,
            ...options,
        };
        if (opts.redactSSN) {
            redactedText = redactedText.replace(this.patterns.ssn, (match, offset) => {
                redactedItems.push({
                    type: 'SSN',
                    value: match,
                    position: { start: offset, end: offset + match.length },
                });
                return '[REDACTED-SSN]';
            });
        }
        if (opts.redactPhone) {
            redactedText = redactedText.replace(this.patterns.phone, (match, offset) => {
                redactedItems.push({
                    type: 'PHONE',
                    value: match,
                    position: { start: offset, end: offset + match.length },
                });
                return '[REDACTED-PHONE]';
            });
        }
        if (opts.redactEmail) {
            redactedText = redactedText.replace(this.patterns.email, (match, offset) => {
                redactedItems.push({
                    type: 'EMAIL',
                    value: match,
                    position: { start: offset, end: offset + match.length },
                });
                return '[REDACTED-EMAIL]';
            });
        }
        if (opts.redactDates) {
            redactedText = redactedText.replace(this.patterns.date, (match, offset) => {
                redactedItems.push({
                    type: 'DATE',
                    value: match,
                    position: { start: offset, end: offset + match.length },
                });
                return '[REDACTED-DATE]';
            });
        }
        if (opts.redactAddress) {
            redactedText = redactedText.replace(this.patterns.zipCode, (match, offset) => {
                redactedItems.push({
                    type: 'ZIP_CODE',
                    value: match,
                    position: { start: offset, end: offset + match.length },
                });
                return '[REDACTED-ZIP]';
            });
        }
        if (opts.customPatterns) {
            opts.customPatterns.forEach(({ pattern, replacement }) => {
                redactedText = redactedText.replace(pattern, (match, offset) => {
                    redactedItems.push({
                        type: 'CUSTOM',
                        value: match,
                        position: { start: offset, end: offset + match.length },
                    });
                    return replacement;
                });
            });
        }
        return { redactedText, redactedItems };
    }
    redactPatientNames(text, patient) {
        if (!text || !patient) {
            return { redactedText: text || '', redactedItems: [] };
        }
        let redacted = text;
        const redactedItems = [];
        const fullName = `${patient.firstName} ${patient.lastName}`;
        const firstName = patient.firstName;
        const lastName = patient.lastName;
        const fullNameRegex = new RegExp(fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        redacted = redacted.replace(fullNameRegex, (match, offset) => {
            redactedItems.push({
                type: 'PATIENT_NAME',
                value: match,
                position: { start: offset, end: offset + match.length },
            });
            return '[PATIENT-NAME]';
        });
        const firstNameRegex = new RegExp(`\\b${firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        redacted = redacted.replace(firstNameRegex, (match, offset) => {
            const alreadyRedacted = redactedItems.some((item) => item.type === 'PATIENT_NAME' &&
                item.position &&
                offset >= item.position.start &&
                offset < item.position.end);
            if (!alreadyRedacted) {
                redactedItems.push({
                    type: 'PATIENT_FIRST_NAME',
                    value: match,
                    position: { start: offset, end: offset + match.length },
                });
            }
            return '[PATIENT-FIRST-NAME]';
        });
        const lastNameRegex = new RegExp(`\\b${lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        redacted = redacted.replace(lastNameRegex, (match, offset) => {
            const alreadyRedacted = redactedItems.some((item) => item.type === 'PATIENT_NAME' &&
                item.position &&
                offset >= item.position.start &&
                offset < item.position.end);
            if (!alreadyRedacted) {
                redactedItems.push({
                    type: 'PATIENT_LAST_NAME',
                    value: match,
                    position: { start: offset, end: offset + match.length },
                });
            }
            return '[PATIENT-LAST-NAME]';
        });
        return { redactedText: redacted, redactedItems };
    }
    redactComprehensive(text, patient, options) {
        let redactedText = text;
        let allRedactedItems = [];
        if (patient) {
            const nameResult = this.redactPatientNames(redactedText, patient);
            redactedText = nameResult.redactedText;
            allRedactedItems = [...nameResult.redactedItems];
        }
        const patternResult = this.redactText(redactedText, options);
        redactedText = patternResult.redactedText;
        allRedactedItems = [...allRedactedItems, ...patternResult.redactedItems];
        return { redactedText, redactedItems: allRedactedItems };
    }
};
exports.RedactionService = RedactionService;
exports.RedactionService = RedactionService = __decorate([
    (0, common_1.Injectable)()
], RedactionService);
//# sourceMappingURL=redaction.service.js.map