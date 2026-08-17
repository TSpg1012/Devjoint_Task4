import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // test case
  //   @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOrphanFilesCleanup() {
    this.logger.log('Running scheduled cleanup: orphan poster files');

    const uploadsDir = join(process.cwd(), 'uploads');
    const filesOnDisk = readdirSync(uploadsDir);

    const shows = await this.prisma.show.findMany({
      where: { posterUrl: { not: null } },
      select: { posterUrl: true },
    });
    const usedFiles = new Set(shows.map((s) => s.posterUrl));

    let deletedCount = 0;
    for (const file of filesOnDisk) {
      if (!usedFiles.has(file)) {
        unlinkSync(join(uploadsDir, file));
        deletedCount++;
        this.logger.log(`Deleted orphan file: ${file}`);
      }
    }

    this.logger.log(
      `Cleanup finished. Deleted ${deletedCount} orphan file(s).`,
    );
  }
}
