import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeService } from './realtime.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private realtimeService;
    private sessionsService;
    private usersService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, realtimeService: RealtimeService, sessionsService: SessionsService, usersService: UsersService);
    handleConnection(client: WebSocket, ...args: any[]): Promise<void>;
    handleDisconnect(client: WebSocket): Promise<void>;
    private getClientId;
}
