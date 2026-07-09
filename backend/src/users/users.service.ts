import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser, UpdateUserData, UsersRepository } from './users.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async getMe(userId: string): Promise<SafeUser> {
    return this.findOne(userId);
  }

  async findAll(): Promise<SafeUser[]> {
    return this.usersRepository.findAll();
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto, actorId?: string): Promise<SafeUser> {
    await this.ensureEmailAvailable(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.usersRepository.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      role: dto.role,
      isActive: dto.isActive ?? true,
    });
    void this.auditLog.log({
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      userId: actorId,
      metadata: { email: user.email, role: user.role },
    });
    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorId?: string,
  ): Promise<SafeUser> {
    const existing = await this.findOne(id);

    if (dto.email) {
      await this.ensureEmailAvailable(dto.email, id);
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, SALT_ROUNDS)
      : undefined;

    const data: UpdateUserData = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.email !== undefined
        ? { email: dto.email.toLowerCase().trim() }
        : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    };

    const user = await this.usersRepository.update(id, data);

    if (dto.role !== undefined && dto.role !== existing.role) {
      void this.auditLog.log({
        action: 'USER_ROLE_CHANGED',
        entityType: 'User',
        entityId: id,
        userId: actorId,
        metadata: { from: existing.role, to: dto.role },
      });
    }

    if (passwordHash || dto.isActive === false) {
      await this.usersRepository.revokeAllRefreshTokensForUser(id);
    }

    return user;
  }

  async setActive(
    id: string,
    isActive: boolean,
    actorId?: string,
  ): Promise<SafeUser> {
    const user = await this.update(id, { isActive }, actorId);

    void this.auditLog.log({
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      userId: actorId,
    });

    if (!isActive) {
      await this.usersRepository.revokeAllRefreshTokensForUser(id);
    }

    return user;
  }

  private async ensureEmailAvailable(
    email: string,
    currentUserId?: string,
  ): Promise<void> {
    const existing = await this.usersRepository.findByEmail(
      email.toLowerCase().trim(),
    );

    if (existing && existing.id !== currentUserId) {
      throw new ConflictException('This email is already in use');
    }
  }
}
