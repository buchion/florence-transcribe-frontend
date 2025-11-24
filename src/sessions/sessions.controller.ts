import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('upload-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('session_id') sessionId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    const sessionIdNum = parseInt(sessionId, 10);
    if (isNaN(sessionIdNum)) {
      throw new BadRequestException('Invalid session ID');
    }

    // Process audio asynchronously (don't wait for completion)
    this.sessionsService.processAudioWithSpeakerDiarization(
      sessionIdNum,
      file.buffer,
      file.mimetype,
    ).catch((error) => {
      console.error(`Error processing audio for session ${sessionIdNum}:`, error);
    });

    return {
      message: 'Audio uploaded successfully. Post-processing with speaker diarization started.',
      sessionId: sessionIdNum,
    };
  }

  @Post(':id/reprocess-speakers')
  async reprocessSpeakers(@Param('id', ParseIntPipe) sessionId: number) {
    return this.sessionsService.reprocessSessionWithSpeakerDiarization(sessionId);
  }
}

