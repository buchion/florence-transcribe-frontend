import { User } from '../../users/entities/user.entity';
export declare class UsageTracking {
    id: number;
    userId: number;
    user: User;
    periodStart: Date;
    periodEnd: Date;
    audioHoursUsed: number;
    notesCreated: number;
    createdAt: Date;
    updatedAt: Date;
}
