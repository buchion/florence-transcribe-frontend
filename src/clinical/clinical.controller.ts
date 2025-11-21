import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { ClinicalizeDto } from './dto/clinicalize.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TranscriptsService } from '../transcripts/transcripts.service';

@Controller('clinicalize')
export class ClinicalController {
  constructor(
    private clinicalService: ClinicalService,
    private transcriptsService: TranscriptsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async clinicalize(@Body() dto: ClinicalizeDto) {
    let transcriptText: string;

    if (dto.transcript_text) {
      transcriptText = dto.transcript_text;
    } else if (dto.session_id) {
      transcriptText = await this.transcriptsService.getFullTranscript(
        dto.session_id,
      );
      if (!transcriptText) {
        throw new NotFoundException('Transcript not found');
      }
    } else {
      throw new BadRequestException(
        'Either transcript_text or session_id must be provided',
      );
    }

    return this.clinicalService.extract(transcriptText, dto.session_id);
  }
}

