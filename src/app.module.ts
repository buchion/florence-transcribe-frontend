import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import { TranscriptsModule } from './transcripts/transcripts.module';
import { ClinicalModule } from './clinical/clinical.module';
import { SoapModule } from './soap/soap.module';
import { ExportModule } from './export/export.module';
import { AdminModule } from './admin/admin.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    AuthModule,
    UsersModule,
    SessionsModule,
    TranscriptsModule,
    ClinicalModule,
    SoapModule,
    ExportModule,
    AdminModule,
    RealtimeModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

