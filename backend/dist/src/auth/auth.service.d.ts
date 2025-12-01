import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<Omit<User, 'hashedPassword'>>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        token_type: string;
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        token_type: string;
    }>;
    validateUser(userId: number): Promise<User | null>;
    private createAccessToken;
    private createRefreshToken;
}
