import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'videos');

// 컨테이너 시작 시 디렉토리 생성
try {
  mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // 이미 존재하면 무시
}

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  @Post('video')
  @ApiOperation({ summary: 'MP4 동영상 업로드' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype === 'video/mp4' ||
          file.mimetype === 'video/webm' ||
          file.mimetype === 'video/ogg'
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException('MP4, WebM, OGG 파일만 업로드할 수 있습니다.'), false);
        }
      },
    }),
  )
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('파일이 없습니다.');
    return { url: `/uploads/videos/${file.filename}` };
  }
}
