import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ShowsModule } from './shows/shows.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CacheModule.register({
      isGlobal: true,
      ttl: 60000, 
    }),
    PrismaModule,
    ShowsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
