export declare class ComposeDto {
    extraction_id?: number;
    clinical_extraction?: {
        problems?: Array<any>;
        medications?: Array<any>;
        orders?: Array<any>;
        vitals?: Array<any>;
    };
    transcript_text?: string;
}
