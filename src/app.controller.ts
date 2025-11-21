import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Florence Transcribe API',
      version: '1.0.0',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
    };
  }
}

