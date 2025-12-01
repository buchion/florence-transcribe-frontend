import { Session } from '../../sessions/entities/session.entity';
import { ClinicalExtraction } from '../../clinical/entities/clinical-extraction.entity';
export declare class Transcript {
    id: number;
    sessionId: number;
    session: Session;
    text: string;
    isInterim: boolean;
    speaker: string;
    createdAt: Date;
    clinicalExtractions: ClinicalExtraction[];
}
