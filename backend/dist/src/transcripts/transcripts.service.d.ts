import { Repository } from 'typeorm';
import { Transcript } from './entities/transcript.entity';
export declare class TranscriptsService {
    private transcriptsRepository;
    constructor(transcriptsRepository: Repository<Transcript>);
    create(transcriptData: Partial<Transcript>): Promise<Transcript>;
    findBySessionId(sessionId: number): Promise<Transcript[]>;
    getFullTranscript(sessionId: number): Promise<string>;
    findById(id: number): Promise<Transcript | null>;
    update(id: number, updateData: Partial<Transcript>): Promise<Transcript>;
}
