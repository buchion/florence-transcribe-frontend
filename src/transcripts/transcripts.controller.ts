import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TranscriptsService } from './transcripts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transcripts')
@UseGuards(JwtAuthGuard)
export class TranscriptsController {
  constructor(private transcriptsService: TranscriptsService) {}

  @Get('session/:sessionId')
  async getBySessionId(@Param('sessionId', ParseIntPipe) sessionId: number) {
    const transcripts = await this.transcriptsService.findBySessionId(sessionId);
    return { transcripts };
  }
}

