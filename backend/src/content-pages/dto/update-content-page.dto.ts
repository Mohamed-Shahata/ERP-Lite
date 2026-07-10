import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateContentPageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  // Rich-text HTML from the admin editor. Sanitized server-side in the
  // service before it's persisted or ever rendered publicly.
  @IsString()
  body!: string;
}
