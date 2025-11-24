import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssemblyAI } from 'assemblyai';
import { Session, SessionStatus } from './entities/session.entity';
import { PatientsService } from '../patients/patients.service';
import { TranscriptsService } from '../transcripts/transcripts.service';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private patientsService: PatientsService,
    private transcriptsService: TranscriptsService,
    private configService: ConfigService,
  ) {}

  async create(sessionData: Partial<Session>): Promise<Session> {
    // Handle Patient relationship if patientEntityId is provided
    // Otherwise, keep backward compatibility with string patientId
    const session = this.sessionsRepository.create(sessionData);
    
    // If patientEntityId is provided, ensure the patient exists and belongs to the user
    if (sessionData.patientEntityId && sessionData.userId) {
      try {
        await this.patientsService.findOne(sessionData.patientEntityId, sessionData.userId);
      } catch (error) {
        throw new Error(`Patient with ID ${sessionData.patientEntityId} not found or does not belong to user`);
      }
    }
    
    return this.sessionsRepository.save(session);
  }

  async findById(id: number): Promise<Session | null> {
    return this.sessionsRepository.findOne({
      where: { id },
      relations: ['user', 'patient'],
    });
  }

  async findByUserId(
    userId: number,
    skip: number = 0,
    limit: number = 100,
  ): Promise<[Session[], number]> {
    return this.sessionsRepository.findAndCount({
      where: { userId },
      relations: ['user', 'patient'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(
    skip: number = 0,
    limit: number = 100,
    userId?: number,
  ): Promise<[Session[], number]> {
    const where = userId ? { userId } : {};
    return this.sessionsRepository.findAndCount({
      where,
      relations: ['user', 'patient'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: number,
    status: SessionStatus,
    endedAt?: Date,
  ): Promise<Session> {
    await this.sessionsRepository.update(id, { status, endedAt });
    return this.findById(id);
  }

  /**
   * Process audio file with AssemblyAI pre-recorded API to get accurate speaker diarization
   */
  async processAudioWithSpeakerDiarization(
    sessionId: number,
    audioBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    this.logger.log(`Starting speaker diarization processing for session ${sessionId}`);

    const apiKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
    if (!apiKey) {
      this.logger.error('AssemblyAI API key not configured');
      throw new Error('AssemblyAI API key not configured');
    }

    // Verify session exists
    const session = await this.findById(sessionId);
    if (!session) {
      this.logger.error(`Session ${sessionId} not found`);
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const assemblyaiClient = new AssemblyAI({ apiKey });

      // Transcribe audio with speaker diarization (transcribe() automatically waits for completion)
      this.logger.log(`Starting transcription with speaker diarization for session ${sessionId}...`);
      const result = await assemblyaiClient.transcripts.transcribe({
        audio: audioBuffer,
        speaker_labels: true,
        speakers_expected: 4, // Support up to 4 speakers
        language_code: 'en', // Adjust if needed
      });

      if (result.status === 'error') {
        this.logger.error(`Transcription failed for session ${sessionId}: ${result.error}`);
        throw new Error(`Transcription failed: ${result.error}`);
      }

      // Update transcripts with accurate speaker labels
      await this.updateTranscriptsWithSpeakerLabels(sessionId, result);

      this.logger.log(`Successfully processed speaker diarization for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error processing audio for session ${sessionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reprocess an existing session's audio file (if available)
   */
  async reprocessSessionWithSpeakerDiarization(sessionId: number): Promise<{ message: string }> {
    // This would require storing audio files, which we're not doing yet
    // For now, return a message indicating this feature needs audio storage
    return {
      message: 'Audio reprocessing requires audio file storage. Please upload audio file directly.',
    };
  }

  /**
   * Match utterances from pre-recorded API to existing transcripts and update speaker labels
   */
  private async updateTranscriptsWithSpeakerLabels(
    sessionId: number,
    transcriptResult: any,
  ): Promise<void> {
    if (!transcriptResult.utterances || transcriptResult.utterances.length === 0) {
      this.logger.warn(`No utterances found in transcript result for session ${sessionId}`);
      return;
    }

    // Get existing transcripts for this session
    const existingTranscripts = await this.transcriptsService.findBySessionId(sessionId);
    const finalTranscripts = existingTranscripts.filter((t) => !t.isInterim);

    if (finalTranscripts.length === 0) {
      this.logger.warn(`No existing transcripts found for session ${sessionId}`);
      return;
    }

    // Create a mapping of utterance text to speaker
    // We'll match utterances to transcripts by text similarity and timing
    const utteranceMap = new Map<string, string>();
    
    for (const utterance of transcriptResult.utterances) {
      const text = utterance.text?.trim().toLowerCase();
      if (text) {
        // Store speaker for this utterance text
        utteranceMap.set(text, utterance.speaker || 'A');
      }
    }

    // Update transcripts by matching text
    let updatedCount = 0;
    for (const transcript of finalTranscripts) {
      const transcriptText = transcript.text?.trim().toLowerCase();
      if (!transcriptText) continue;

      // Try to find matching utterance
      // Simple approach: find utterance with highest text similarity
      let bestMatch: { speaker: string; similarity: number } | null = null;

      for (const [utteranceText, speaker] of utteranceMap.entries()) {
        const similarity = this.calculateTextSimilarity(transcriptText, utteranceText);
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { speaker, similarity };
        }
      }

      // Update if we found a reasonable match (similarity > 0.5)
      if (bestMatch && bestMatch.similarity > 0.5) {
        // Map AssemblyAI speaker labels (A, B, C, D) to our format
        // They're already in the same format, so we can use directly
        if (transcript.speaker !== bestMatch.speaker) {
          await this.transcriptsService.update(transcript.id, {
            speaker: bestMatch.speaker,
          });
          updatedCount++;
        }
      }
    }

    this.logger.log(
      `Updated ${updatedCount} out of ${finalTranscripts.length} transcripts with speaker labels for session ${sessionId}`,
    );
  }

  /**
   * Calculate text similarity using simple word overlap
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/).filter((w) => w.length > 0));
    const words2 = new Set(text2.split(/\s+/).filter((w) => w.length > 0));

    if (words1.size === 0 && words2.size === 0) return 1.0;
    if (words1.size === 0 || words2.size === 0) return 0.0;

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard similarity
  }
}

