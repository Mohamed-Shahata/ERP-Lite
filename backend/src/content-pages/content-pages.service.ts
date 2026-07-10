import { BadRequestException, Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { ContentPage } from '../../generated/prisma/client';
import { PageSlug } from '../../generated/prisma/enums';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { ContentPagesRepository } from './content-pages.repository';
import { UpdateContentPageDto } from './dto/update-content-page.dto';

const ALL_SLUGS: PageSlug[] = ['HELP', 'PRIVACY', 'TERMS', 'SUPPORT', 'TEAMS'];

// What the rich-text editor is allowed to produce. Keeps admin-authored
// content safe to render as raw HTML on the public login screen.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'a',
    'blockquote',
    'hr',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['style'],
  },
  allowedStyles: {
    span: { color: [/^#[0-9a-fA-F]{3,6}$/] },
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
  },
};

function assertKnownSlug(slug: string): asserts slug is PageSlug {
  if (!ALL_SLUGS.includes(slug as PageSlug)) {
    throw new BadRequestException(`Unknown page slug: ${slug}`);
  }
}

@Injectable()
export class ContentPagesService {
  constructor(
    private readonly repository: ContentPagesRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  findAll(): Promise<ContentPage[]> {
    return this.repository.findAll();
  }

  findOne(slug: string): Promise<ContentPage> {
    assertKnownSlug(slug);
    return this.repository.findOrCreate(slug);
  }

  async update(
    slug: string,
    dto: UpdateContentPageDto,
    actorId?: string,
  ): Promise<ContentPage> {
    assertKnownSlug(slug);

    const body = sanitizeHtml(dto.body, SANITIZE_OPTIONS);
    const updated = await this.repository.upsert(slug, {
      title: dto.title,
      body,
    });

    void this.auditLog.log({
      action: 'CONTENT_PAGE_UPDATED',
      entityType: 'ContentPage',
      entityId: updated.id,
      userId: actorId,
      metadata: { slug },
    });

    return updated;
  }
}
