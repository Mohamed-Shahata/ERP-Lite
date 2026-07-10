import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ContentPage } from '../../generated/prisma/client';
import { PageSlug } from '../../generated/prisma/enums';

// Default title shown the first time an admin opens a page that has never
// been saved before (the row is created lazily on first read).
const DEFAULT_TITLES: Record<PageSlug, string> = {
  HELP: 'Help',
  PRIVACY: 'Privacy Policy',
  TERMS: 'Terms of Use',
  SUPPORT: 'Support',
  TEAMS: 'Teams',
};

@Injectable()
export class ContentPagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ContentPage[]> {
    return this.prisma.contentPage.findMany({ orderBy: { slug: 'asc' } });
  }

  async findOrCreate(slug: PageSlug): Promise<ContentPage> {
    const existing = await this.prisma.contentPage.findUnique({
      where: { slug },
    });
    if (existing) return existing;

    return this.prisma.contentPage.create({
      data: { slug, title: DEFAULT_TITLES[slug], body: '' },
    });
  }

  async upsert(
    slug: PageSlug,
    data: { title: string; body: string },
  ): Promise<ContentPage> {
    return this.prisma.contentPage.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }
}
