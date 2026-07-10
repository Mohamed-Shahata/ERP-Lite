import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { CurrentUserPayload } from '../common/interfaces/current-user.interface';
import { ContentPagesService } from './content-pages.service';
import { UpdateContentPageDto } from './dto/update-content-page.dto';

@Controller('content-pages')
export class ContentPagesController {
  constructor(private readonly contentPagesService: ContentPagesService) {}

  // Public: the login screen (unauthenticated) links to Help/Privacy/
  // Terms/Support, and the dashboard footer links to Teams.
  @Get()
  findAll() {
    return this.contentPagesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.contentPagesService.findOne(slug.toUpperCase());
  }

  // Only Admins can edit page content.
  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('slug') slug: string,
    @Body() dto: UpdateContentPageDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contentPagesService.update(slug.toUpperCase(), dto, user.id);
  }
}
