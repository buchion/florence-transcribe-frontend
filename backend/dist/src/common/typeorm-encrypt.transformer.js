"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEncryptionService = setEncryptionService;
exports.getEncryptionService = getEncryptionService;
exports.createEncryptTransformer = createEncryptTransformer;
let encryptionServiceInstance = null;
function setEncryptionService(service) {
    encryptionServiceInstance = service;
}
function getEncryptionService() {
    return encryptionServiceInstance;
}
function createEncryptTransformer() {
    return {
        to: (value) => {
            if (!value || value === null || value === undefined)
                return value;
            const encryptionService = getEncryptionService();
            if (!encryptionService) {
                console.warn('EncryptionService not available, storing plain text');
                return value;
            }
            try {
                return encryptionService.encrypt(value);
            }
            catch (error) {
                console.error('Encryption failed:', error);
                throw error;
            }
        },
        from: (value) => {
            if (!value || value === null || value === undefined)
                return value;
            const encryptionService = getEncryptionService();
            if (!encryptionService) {
                return value;
            }
            if (typeof value === 'string' && value.includes(':') && value.split(':').length === 3) {
                try {
                    return encryptionService.decrypt(value);
                }
                catch (error) {
                    console.warn('Decryption failed, returning as-is:', error.message);
                    return value;
                }
            }
            return value;
        },
    };
}
//# sourceMappingURL=typeorm-encrypt.transformer.js.map