import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from '../common/guards/roles.guard';
import { MailModule } from '../common/mail/mail.module';
import { ConfigKeys } from '../config/configuration';
import type { StringValue } from 'ms';

@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(ConfigKeys.JWT_SECRET),
        signOptions: {
          expiresIn: config.get<StringValue>(ConfigKeys.JWT_EXPIRES_IN),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, RolesGuard],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
