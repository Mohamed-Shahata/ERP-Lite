import { Role } from '../../../generated/prisma/enums';

export interface CurrentUserPayload {
  id: string;
  email: string;
  role: Role;
}
