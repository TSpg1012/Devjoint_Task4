import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ShowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateShowDto) {
    const show = await this.prisma.show.create({ data: dto });
    this.eventEmitter.emit('show.created', { id: show.id, title: show.title });
    await this.cacheManager.del('all_shows');
    return show;
  }

  async findAll() {
    console.log('DB HIT: findAll shows');
    return this.prisma.show.findMany();
  }

  async findOne(id: number) {
    console.log('DB HIT: findOne show', id);
    const show = await this.prisma.show.findUnique({ where: { id } });
    if (!show) throw new NotFoundException(`Show ${id} not found`);
    return show;
  }

  async update(id: number, dto: UpdateShowDto) {
    await this.findOne(id);
    const updated = await this.prisma.show.update({ where: { id }, data: dto });
    await this.cacheManager.del('all_shows');
    return updated;
  }

  async remove(id: number) {
    const show = await this.findOne(id);
    if (show.posterUrl) {
      const filePath = join(process.cwd(), 'uploads', show.posterUrl);
      if (existsSync(filePath)) unlinkSync(filePath);
    }
    const deleted = await this.prisma.show.delete({ where: { id } });
    await this.cacheManager.del('all_shows');
    return deleted;
  }

  async updatePoster(id: number, filename: string) {
    const show = await this.findOne(id);
    if (show.posterUrl) {
      const oldPath = join(process.cwd(), 'uploads', show.posterUrl);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    const updated = await this.prisma.show.update({
      where: { id },
      data: { posterUrl: filename },
    });
    await this.cacheManager.del('all_shows'); // posterUrl da findAll cavabında görünür
    return updated;
  }
}
