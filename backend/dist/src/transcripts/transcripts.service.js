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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transcript_entity_1 = require("./entities/transcript.entity");
let TranscriptsService = class TranscriptsService {
    constructor(transcriptsRepository) {
        this.transcriptsRepository = transcriptsRepository;
    }
    async create(transcriptData) {
        const transcript = this.transcriptsRepository.create(transcriptData);
        return this.transcriptsRepository.save(transcript);
    }
    async findBySessionId(sessionId) {
        return this.transcriptsRepository.find({
            where: { sessionId },
            order: { createdAt: 'ASC' },
        });
    }
    async getFullTranscript(sessionId) {
        const transcripts = await this.findBySessionId(sessionId);
        return transcripts
            .filter((t) => !t.isInterim)
            .map((t) => t.text)
            .join(' ');
    }
    async findById(id) {
        return this.transcriptsRepository.findOne({ where: { id } });
    }
    async update(id, updateData) {
        const allowedFields = ['speaker'];
        const filteredData = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined && updateData[field] !== null) {
                filteredData[field] = updateData[field];
            }
        }
        if (Object.keys(filteredData).length === 0) {
            throw new Error('No valid fields to update');
        }
        await this.transcriptsRepository.update(id, filteredData);
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error(`Transcript with id ${id} not found`);
        }
        return updated;
    }
};
exports.TranscriptsService = TranscriptsService;
exports.TranscriptsService = TranscriptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transcript_entity_1.Transcript)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TranscriptsService);
//# sourceMappingURL=transcripts.service.js.map