/**
 * @module auth
 * @description JWT authentication middleware for TalentTrust.
 *
 * This module re-exports the canonical JWT-based middleware from
 * `./authorization` as the authoritative authentication layer.
 *
 * Token verification uses HS256 with `JWT_SECRET` from the environment.
 * Demo tokens are no longer accepted in any environment.
 *
 * Expected JWT payload:
 * ```json
 * {
 *   "sub":   "<userId>",
 *   "email": "<userEmail>",
 *   "role":  "admin" | "client" | "freelancer",
 *   "iat":   <issuedAt>,
 *   "exp":   <expiresAt>
 * }
 * ```
 *
 * On success `req.user` is set to `{ id, email, role }`.
 * On failure the middleware responds with HTTP 401.
 */

// Re-export the canonical types and middleware so existing callers that
// import from './auth' continue to work without changes.
import { requirePermission } from './authorization';
import { database } from '../database';

export type { AuthenticatedRequest } from '../lib/types';
export { requireAuth as authMiddleware } from './authorization';
export { requireRole, requirePermission } from './authorization';

// Specialized RBAC guard used by contract metadata routes
export const requireContractAccess = requirePermission('contracts', 'update', async (req) => {
  const contractId = req.params.contractId;
  if (!contractId) return null;
  const contract = await database.getContractById(contractId);
  return contract ? contract.created_by : null;
});

