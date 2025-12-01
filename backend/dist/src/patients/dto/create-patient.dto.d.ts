export declare class CreatePatientDto {
    patientId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    nextOfKin?: Record<string, any>;
    insuranceDetails?: Record<string, any>;
    nationalId?: string;
    ethnicity?: string;
    pastMedicalHistory?: string;
    familyMedicalHistory?: string;
    lifestyleFactors?: Record<string, any>;
    currentMedications?: string;
    allergies?: string;
    pastSurgeries?: string;
}
