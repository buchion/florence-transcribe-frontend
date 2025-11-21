import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { SoapService } from './soap.service';
import { ComposeDto } from './dto/compose.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('compose')
export class SoapController {
  constructor(private soapService: SoapService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async compose(@Body() dto: ComposeDto) {
    return this.soapService.compose(
      dto.extraction_id,
      dto.clinical_extraction,
      dto.transcript_text,
    );
  }
}

