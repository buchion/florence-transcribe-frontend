export interface RedactionOptions {
    redactNames?: boolean;
    redactDates?: boolean;
    redactPhone?: boolean;
    redactEmail?: boolean;
    redactSSN?: boolean;
    redactAddress?: boolean;
    customPatterns?: Array<{
        pattern: RegExp;
        replacement: string;
    }>;
}
export interface RedactedItem {
    type: string;
    value: string;
    position?: {
        start: number;
        end: number;
    };
}
export declare class RedactionService {
    private readonly patterns;
    redactText(text: string, options?: RedactionOptions): {
        redactedText: string;
        redactedItems: RedactedItem[];
    };
    redactPatientNames(text: string, patient: {
        firstName: string;
        lastName: string;
    }): {
        redactedText: string;
        redactedItems: RedactedItem[];
    };
    redactComprehensive(text: string, patient?: {
        firstName: string;
        lastName: string;
    }, options?: RedactionOptions): {
        redactedText: string;
        redactedItems: RedactedItem[];
    };
}
