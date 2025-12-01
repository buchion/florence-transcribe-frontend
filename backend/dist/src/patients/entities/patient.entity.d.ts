import { Session } from '../../sessions/entities/session.entity';
import { User } from '../../users/entities/user.entity';
export declare class Patient {
    id: number;
    userId: number;
    user: User;
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: Date;
    gender: string;
    address: string;
    nextOfKin: Record<string, any>;
    insuranceDetails: Record<string, any>;
    nationalId: string;
    ethnicity: string;
    pastMedicalHistory: string;
    familyMedicalHistory: string;
    lifestyleFactors: Record<string, any>;
    currentMedications: string;
    allergies: string;
    pastSurgeries: string;
    createdAt: Date;
    updatedAt: Date;
    sessions: Session[];
}
