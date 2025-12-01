export declare enum PlanType {
    LITE = "LITE",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export declare class SubscriptionPlan {
    id: number;
    planType: PlanType;
    name: string;
    price: number;
    audioHoursLimit: number | null;
    notesLimit: number | null;
    features: {
        multiUser?: boolean;
        ehrIntegration?: boolean;
        [key: string]: any;
    } | null;
    createdAt: Date;
    updatedAt: Date;
}
