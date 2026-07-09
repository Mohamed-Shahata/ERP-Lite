import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUserPayload } from '../common/interfaces/current-user.interface';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

const ALLOWED_LOGO_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]);

@Controller('company-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanySettingsController {
  constructor(
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  // Read access is open to any authenticated user: invoice printing, the
  // header, etc. all need currency/name/logo regardless of role.
  @Get()
  findOne() {
    return this.companySettingsService.findOne();
  }

  // Only Admins can change company-wide settings.
  @Patch()
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (_req, file, callback) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_LOGO_TYPES.has(file.mimetype)) {
          callback(
            new BadRequestException(
              'Logo must be a PNG, JPEG, WEBP, or SVG image',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  update(
    @Body() dto: UpdateCompanySettingsDto,
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.companySettingsService.update(dto, logo, user.id);
  }
}
