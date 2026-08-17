import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('shows')
@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new show' })
  create(@Body() dto: CreateShowDto) {
    return this.showsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shows (cached)' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_shows')
  @CacheTTL(60000)
  findAll() {
    return this.showsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single show by id' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id') id: string) {
    return this.showsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a show' })
  @ApiParam({ name: 'id', example: 1 })
  update(@Param('id') id: string, @Body() dto: UpdateShowDto) {
    return this.showsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a show (also removes its poster file if present)',
  })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id') id: string) {
    return this.showsService.remove(+id);
  }

  @Post(':id/poster')
  @ApiOperation({ summary: 'Upload a poster image for a show' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only JPEG, PNG, or WEBP images are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async uploadPoster(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.showsService.updatePoster(+id, file.filename);
  }

  @Get(':id/poster')
  @ApiOperation({ summary: 'Download the poster image for a show' })
  @ApiParam({ name: 'id', example: 1 })
  async downloadPoster(@Param('id') id: string, @Res() res: Response) {
    const show = await this.showsService.findOne(+id);
    if (!show.posterUrl) {
      throw new NotFoundException('Poster not found');
    }
    const filePath = join(process.cwd(), 'uploads', show.posterUrl);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Poster file missing on disk');
    }
    return res.sendFile(filePath);
  }
}
