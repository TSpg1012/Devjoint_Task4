import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ShowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateShowDto) {
    const show = await this.prisma.show.create({ data: dto });
    this.eventEmitter.emit('show.created', { id: show.id, title: show.title });
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
    return this.prisma.show.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.show.delete({ where: { id } });
  }

  async updatePoster(id: number, filename: string) {
    await this.findOne(id);
    console.log('Updating poster for show', id);
    return this.prisma.show.update({
      where: { id },
      data: { posterUrl: filename },
    });
  }
}
