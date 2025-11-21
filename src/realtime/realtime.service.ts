import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocket } from 'ws';
import { TranscriptsService } from '../transcripts/transcripts.service';
import { AssemblyAI } from 'assemblyai';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private activeSessions: Map<number, any> = new Map(); // sessionId -> AssemblyAI session

  constructor(
    private configService: ConfigService,
    private transcriptsService: TranscriptsService,
  ) {}

  async initializeSession(
    client: WebSocket,
    sessionId: number,
  ): Promise<string> {
    const clientId = (client as any).clientId || 'unknown';
    this.logger.log(`[RealtimeService] Initializing session ${sessionId} for client ${clientId}`);

    const apiKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
    if (!apiKey) {
      this.logger.warn(`[RealtimeService] AssemblyAI API key not configured - connection will stay open but transcription disabled`);
      // Don't throw error - allow connection to stay open
      // Return a placeholder session ID
      const placeholderSessionId = `placeholder_${sessionId}_${Date.now()}`;
      this.activeSessions.set(sessionId, {
        client,
        sessionId: placeholderSessionId,
        audioBytesReceived: 0,
        audioChunksReceived: 0,
        startedAt: new Date(),
        assemblyaiEnabled: false,
      });
      return placeholderSessionId;
    }

    // Initialize AssemblyAI RealtimeTranscriber
    let assemblyaiSessionId: string;
    try {
      const assemblyaiClient = new AssemblyAI({ apiKey });
      const transcriber = assemblyaiClient.streaming.transcriber({
        sampleRate: 16000, // Match frontend audio sample rate
      });

      // Set up event handlers for transcripts
      let assemblyaiSessionIdFromOpen: string | null = null;
      
      transcriber.on('open', (event) => {
        assemblyaiSessionIdFromOpen = event.id;
        this.logger.log(`[RealtimeService] AssemblyAI session opened: ${event.id}, expires at: ${event.expires_at}`);
      });

      transcriber.on('turn', (event) => {
        // Check if transcript has text
        if (event.transcript && event.transcript.trim()) {
          // end_of_turn indicates if this is a final transcript
          // If end_of_turn is false, it's an interim/partial transcript
          const isFinal = event.end_of_turn === true;
          
          // Extract speaker information from the event
          // Note: AssemblyAI streaming API doesn't support speaker diarization
          // but we check for it in case it's added in the future or available via other means
          const eventAny = event as any;
          const speaker = eventAny.speaker 
            || eventAny.speaker_label 
            || eventAny.speaker_id
            || undefined;
          
          // Log event structure for debugging (only occasionally to avoid spam)
          if (Math.random() < 0.01 && !speaker) {
            this.logger.debug(`[RealtimeService] Turn event keys: ${Object.keys(eventAny).join(', ')}`);
          }
          
          this.handleTranscript(
            sessionId,
            event.transcript,
            isFinal,
            speaker,
          ).catch((error) => {
            this.logger.error(`[RealtimeService] Error handling transcript: ${error.message}`);
          });
        }
      });

      transcriber.on('error', (error) => {
        this.logger.error(`[RealtimeService] AssemblyAI error for session ${sessionId}: ${error.message}`, error.stack);
        // Send error to WebSocket client
        try {
          const wsClient = this.activeSessions.get(sessionId)?.client;
          if (wsClient) {
            (wsClient as WebSocket).send(JSON.stringify({
              type: 'error',
              message: `Transcription error: ${error.message}`,
            }));
          }
        } catch (sendError) {
          this.logger.error(`[RealtimeService] Failed to send error to client: ${sendError.message}`);
        }
      });

      transcriber.on('close', (code, reason) => {
        this.logger.log(`[RealtimeService] AssemblyAI connection closed for session ${sessionId}: ${code} - ${reason}`);
      });

      // Connect to AssemblyAI
      const beginEvent = await transcriber.connect();
      assemblyaiSessionId = beginEvent.id || `session_${sessionId}_${Date.now()}`;
      this.activeSessions.set(sessionId, {
        client,
        transcriber,
        sessionId: assemblyaiSessionId,
        audioBytesReceived: 0,
        audioChunksReceived: 0,
        startedAt: new Date(),
        assemblyaiEnabled: true,
      });

      this.logger.log(`[RealtimeService] Session ${sessionId} initialized with AssemblyAI session ${assemblyaiSessionId}`);
    } catch (error) {
      this.logger.error(`[RealtimeService] Failed to initialize AssemblyAI for session ${sessionId}: ${error.message}`, error.stack);
      // Fall back to disabled mode
      assemblyaiSessionId = `placeholder_${sessionId}_${Date.now()}`;
      this.activeSessions.set(sessionId, {
        client,
        sessionId: assemblyaiSessionId,
        audioBytesReceived: 0,
        audioChunksReceived: 0,
        startedAt: new Date(),
        assemblyaiEnabled: false,
      });
    }

    // Set up message handler for client (handles binary audio data)
    client.on('message', async (data: Buffer | string) => {
      // Only process binary data (audio)
      if (Buffer.isBuffer(data)) {
        await this.processAudio(client, data);
      } else {
        this.logger.debug(`[RealtimeService] Received non-binary message from client ${clientId}: ${data.toString().substring(0, 100)}`);
      }
    });

    return assemblyaiSessionId;
  }

  async processAudio(client: WebSocket, audioData: Buffer): Promise<void> {
    const sessionId = (client as any).sessionId;
    const clientId = (client as any).clientId || 'unknown';

    if (!sessionId) {
      this.logger.warn(`[RealtimeService] Received audio data but no session ID for client ${clientId}`);
      return;
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      this.logger.warn(`[RealtimeService] Received audio data for unknown session ${sessionId}`);
      return;
    }

    // If AssemblyAI is not enabled, just track stats but don't process
    if (!session.assemblyaiEnabled) {
      session.audioBytesReceived += audioData.length;
      session.audioChunksReceived += 1;
      // Log occasionally to show connection is working
      if (session.audioChunksReceived % 100 === 0) {
        this.logger.debug(`[RealtimeService] Session ${sessionId} - Receiving audio (AssemblyAI disabled): ${session.audioChunksReceived} chunks`);
      }
      return;
    }

    // Track audio statistics
    session.audioBytesReceived += audioData.length;
    session.audioChunksReceived += 1;

    // Log periodically (every 100 chunks or every 10 seconds)
    if (
      session.audioChunksReceived % 100 === 0 ||
      (Date.now() - session.startedAt.getTime()) % 10000 < 100
    ) {
      const duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
      this.logger.debug(
        `[RealtimeService] Session ${sessionId} - Audio stats: ${session.audioChunksReceived} chunks, ${(session.audioBytesReceived / 1024).toFixed(2)} KB, ${duration}s`,
      );
    }

    // Send audio to AssemblyAI
    if (session.transcriber) {
      try {
        // Convert Buffer to Uint8Array for AssemblyAI
        const audioArray = new Uint8Array(audioData);
        session.transcriber.sendAudio(audioArray);
      } catch (error) {
        this.logger.error(`[RealtimeService] Error sending audio to AssemblyAI for session ${sessionId}: ${error.message}`);
      }
    }
  }

  async cleanupSession(client: WebSocket): Promise<void> {
    const sessionId = (client as any).sessionId;
    const clientId = (client as any).clientId || 'unknown';

    if (sessionId) {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        const duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
        this.logger.log(
          `[RealtimeService] Cleaning up session ${sessionId} - Total audio: ${session.audioChunksReceived} chunks, ${(session.audioBytesReceived / 1024).toFixed(2)} KB, Duration: ${duration}s`,
        );

        // Close AssemblyAI connection
        if (session.transcriber) {
          try {
            await session.transcriber.close();
            this.logger.debug(`[RealtimeService] Closed AssemblyAI connection for session ${sessionId}`);
          } catch (error) {
            this.logger.error(`[RealtimeService] Error closing AssemblyAI connection: ${error.message}`);
          }
        }
        this.activeSessions.delete(sessionId);
        this.logger.debug(`[RealtimeService] Session ${sessionId} removed from active sessions`);
      } else {
        this.logger.warn(`[RealtimeService] Attempted to cleanup non-existent session ${sessionId}`);
      }
    } else {
      this.logger.warn(`[RealtimeService] Attempted to cleanup session but no session ID for client ${clientId}`);
    }
  }

  // This method would be called by AssemblyAI event handlers
  async handleTranscript(
    sessionId: number,
    text: string,
    isFinal: boolean,
    speaker?: string,
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.client) {
      this.logger.warn(`[RealtimeService] Received transcript for non-existent session ${sessionId}`);
      return;
    }

    const client = session.client as WebSocket;
    const clientId = (client as any).clientId || 'unknown';
    const transcriptType = isFinal ? 'final' : 'interim';

    this.logger.debug(
      `[RealtimeService] Session ${sessionId} - ${transcriptType} transcript (${text.length} chars, speaker: ${speaker || 'N/A'}): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    );

    if (isFinal) {
      try {
        // Store final transcript
        await this.transcriptsService.create({
          sessionId,
          text,
          isInterim: false,
          speaker,
        });
        this.logger.debug(`[RealtimeService] Stored final transcript for session ${sessionId}`);

        // Send to client
        const message = {
          type: 'final_transcript',
          text,
          speaker,
        };
        client.send(JSON.stringify(message));
        this.logger.debug(`[RealtimeService] Sent final_transcript to client ${clientId}`);
      } catch (error) {
        this.logger.error(`[RealtimeService] Error storing final transcript: ${error.message}`, error.stack);
      }
    } else {
      // Send interim transcript
      const message = {
        type: 'interim_transcript',
        text,
        speaker,
      };
      client.send(JSON.stringify(message));
      // Don't log every interim transcript to avoid spam, but log occasionally
      if (Math.random() < 0.1) {
        // Log ~10% of interim transcripts
        this.logger.debug(`[RealtimeService] Sent interim_transcript to client ${clientId}`);
      }
    }
  }
}

