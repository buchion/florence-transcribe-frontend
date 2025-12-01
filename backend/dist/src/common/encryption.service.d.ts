import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private readonly algorithm;
    private readonly key;
    constructor(configService: ConfigService);
    encrypt(text: string | null | undefined): string | null;
    decrypt(encryptedData: string | null | undefined): string | null;
    static generateKey(): string;
}
