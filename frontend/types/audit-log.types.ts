export interface AuditLogUser {
  id: string;
  name: string;
  email: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  user: AuditLogUser | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
