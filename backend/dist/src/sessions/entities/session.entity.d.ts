import { User } from '../../users/entities/user.entity';
import { Transcript } from '../../transcripts/entities/transcript.entity';
import { Patient } from '../../patients/entities/patient.entity';
export declare enum SessionStatus {
    ACTIVE = "ACTIVE",
    ENDED = "ENDED",
    CANCELLED = "CANCELLED"
}
export declare class Session {
    id: number;
    userId: number;
    user: User;
    patientId: string;
    patientName: string;
    patientEntityId: number;
    patient: Patient;
    status: SessionStatus;
    startedAt: Date;
    endedAt: Date;
    createdAt: Date;
    transcripts: Transcript[];
}
