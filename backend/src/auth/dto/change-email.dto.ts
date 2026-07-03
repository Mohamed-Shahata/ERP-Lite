import { IsEmail, IsUUID } from 'class-validator';

export class ChangeEmailDto {
  @IsUUID()
  userId!: string;

  @IsEmail()
  newEmail!: string;
}
