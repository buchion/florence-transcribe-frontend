"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RealtimeGateway_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const realtime_service_1 = require("./realtime.service");
const sessions_service_1 = require("../sessions/sessions.service");
const users_service_1 = require("../users/users.service");
const session_entity_1 = require("../sessions/entities/session.entity");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    constructor(jwtService, configService, realtimeService, sessionsService, usersService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.realtimeService = realtimeService;
        this.sessionsService = sessionsService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(RealtimeGateway_1.name);
    }
    async handleConnection(client, ...args) {
        const clientId = this.getClientId(client);
        this.logger.log(`[WS] Connection attempt from client ${clientId}`);
        try {
            const request = args[0];
            const urlString = request?.url || client.url || '';
            if (!urlString) {
                this.logger.warn(`[WS] ${clientId} - No URL found in connection`);
                client.close(1008, 'Policy Violation: Invalid connection');
                return;
            }
            const url = new URL(urlString, 'ws://localhost');
            console.log('url', url);
            const token = url.searchParams.get('token');
            this.logger.debug(`[WS] ${clientId} - URL: ${url} Token present: ${token ? 'true' : 'false'}`);
            if (!token) {
                this.logger.warn(`[WS] ${clientId} - Connection rejected: Missing token`);
                client.close(1008, 'Policy Violation: Missing token');
                return;
            }
            let payload;
            try {
                payload = this.jwtService.verify(token, {
                    secret: this.configService.get('JWT_SECRET') || 'default-secret',
                });
                this.logger.debug(`[WS] ${clientId} - Token verified for user: ${payload.sub}`);
            }
            catch (error) {
                this.logger.warn(`[WS] ${clientId} - Token verification failed: ${error.message}`);
                client.close(1008, 'Policy Violation: Invalid token');
                return;
            }
            if (payload.type !== 'access') {
                this.logger.warn(`[WS] ${clientId} - Connection rejected: Invalid token type (expected 'access', got '${payload.type}')`);
                client.close(1008, 'Policy Violation: Invalid token');
                return;
            }
            const userId = payload.sub;
            const user = await this.usersService.findById(userId);
            if (!user || !user.isActive) {
                this.logger.warn(`[WS] ${clientId} - Connection rejected: User ${userId} not found or inactive`);
                client.close(1008, 'Policy Violation: User not found or inactive');
                return;
            }
            const sessionId = url.searchParams.get('session_id');
            const patientId = url.searchParams.get('patient_id');
            const patientName = url.searchParams.get('patient_name');
            const patientEntityId = url.searchParams.get('patient_entity_id');
            this.logger.debug(`[WS] ${clientId} - Query params: session_id=${sessionId}, patient_id=${patientId}, patient_name=${patientName}, patient_entity_id=${patientEntityId}`);
            let session;
            if (sessionId) {
                session = await this.sessionsService.findById(parseInt(sessionId));
                if (!session || session.userId !== userId) {
                    this.logger.warn(`[WS] ${clientId} - Session ${sessionId} not found or not owned by user ${userId}`);
                    client.close(1008, 'Policy Violation: Session not found or not owned by user');
                    return;
                }
                this.logger.log(`[WS] ${clientId} - Resuming existing session ${session.id}`);
            }
            else {
                const sessionData = {
                    userId,
                    patientId: patientId || null,
                    patientName: patientName || null,
                    status: session_entity_1.SessionStatus.ACTIVE,
                };
                if (patientEntityId) {
                    sessionData.patientEntityId = parseInt(patientEntityId);
                }
                session = await this.sessionsService.create(sessionData);
                this.logger.log(`[WS] ${clientId} - Created new session ${session.id} for user ${userId}`);
            }
            client.userId = userId;
            client.sessionId = session.id;
            client.user = user;
            client.connectedAt = new Date();
            client.clientId = clientId;
            try {
                this.logger.debug(`[WS] ${clientId} - Initializing AssemblyAI session...`);
                const assemblyaiSessionId = await this.realtimeService.initializeSession(client, session.id);
                const sessionStartedMsg = {
                    type: 'session_started',
                    session_id: session.id,
                    assemblyai_session_id: assemblyaiSessionId,
                };
                client.send(JSON.stringify(sessionStartedMsg));
                this.logger.debug(`[WS] ${clientId} - Sent session_started message`);
                this.logger.log(`[WS] ${clientId} - ✅ Connected successfully: User ${userId} (${user.email}), Session ${session.id}, AssemblyAI Session ${assemblyaiSessionId}`);
            }
            catch (error) {
                this.logger.error(`[WS] ${clientId} - Failed to initialize AssemblyAI: ${error.message}`, error.stack);
                client.send(JSON.stringify({
                    type: 'error',
                    message: error.message || 'Failed to connect to transcription service',
                }));
                client.close(1011, 'Internal Error');
            }
        }
        catch (error) {
            this.logger.error(`[WS] ${clientId} - Connection error: ${error.message}`, error.stack);
            client.close(1008, 'Policy Violation: Invalid token');
        }
    }
    async handleDisconnect(client) {
        const clientId = client.clientId || this.getClientId(client);
        const userId = client.userId;
        const sessionId = client.sessionId;
        const connectedAt = client.connectedAt;
        if (sessionId) {
            const duration = connectedAt
                ? Math.round((Date.now() - connectedAt.getTime()) / 1000)
                : 0;
            this.logger.log(`[WS] ${clientId} - Disconnecting: User ${userId}, Session ${sessionId}, Duration: ${duration}s`);
            try {
                await this.sessionsService.updateStatus(sessionId, session_entity_1.SessionStatus.ENDED, new Date());
                this.logger.debug(`[WS] ${clientId} - Session ${sessionId} marked as ended`);
                await this.realtimeService.cleanupSession(client);
                this.logger.debug(`[WS] ${clientId} - AssemblyAI session cleaned up`);
            }
            catch (error) {
                this.logger.error(`[WS] ${clientId} - Error during disconnect cleanup: ${error.message}`);
            }
        }
        else {
            this.logger.warn(`[WS] ${clientId} - Disconnected without active session`);
        }
        this.logger.log(`[WS] ${clientId} - ✅ Disconnected`);
    }
    getClientId(client) {
        if (client.clientId) {
            return client.clientId;
        }
        const id = Math.random().toString(36).substring(2, 9);
        client.clientId = id;
        return id;
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof ws_1.Server !== "undefined" && ws_1.Server) === "function" ? _a : Object)
], RealtimeGateway.prototype, "server", void 0);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        path: '/api/realtime/ws',
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        realtime_service_1.RealtimeService,
        sessions_service_1.SessionsService,
        users_service_1.UsersService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map