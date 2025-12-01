import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<Omit<User, "hashedPassword">>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        token_type: string;
    }>;
    refresh(refreshDto: RefreshDto): Promise<{
        access_token: string;
        refresh_token: string;
        token_type: string;
    }>;
    getMe(user: User): Promise<{
        id: number;
        email: string;
        name: string;
        isActive: boolean;
        isVerified: boolean;
        stripeCustomerId: string | null;
        subscriptionId: number | null;
        subscription: import("../subscriptions/entities/user-subscription.entity").UserSubscription | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
