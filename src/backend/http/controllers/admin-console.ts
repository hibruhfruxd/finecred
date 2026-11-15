import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { requireAdmin } from "@/backend/auth/authorization";
import { readListQuery } from "@/backend/http/pagination";
import {
  countActiveAdmins,
  getAdminOverview,
  listAdminPayments,
  listAdminUsers,
  updateUserRoleStatus,
} from "@/backend/db/admin";
import { listAllConsents } from "@/backend/db/consents";
import { listAllReports } from "@/backend/db/reports";
import { listAuditLogs, recordAudit, requestIdFor } from "@/backend/db/audit";
import { listOrganizations } from "@/backend/db/organizations";
import { findUserById, toPublicUser } from "@/backend/db/repository";
import { revokeAllRefreshTokensForUser } from "@/backend/db/refresh-tokens";
import { adminUserUpdateSchema } from "@/models/validation/production";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function overview(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    await requireAdmin(request);
    return NextResponse.json(
      { overview: await getAdminOverview() },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function users(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    await requireAdmin(request);
    const query = readListQuery(request);
    const result = await listAdminUsers(
      { limit: query.limit, offset: query.offset },
      { role: query.role, status: query.status, q: query.q },
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  });
}

export async function updateUser(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const admin = await requireAdmin(request);
    const { id } = await context.params;
    const target = await findUserById(id);
    if (!target) {
      throw new ApiError(404, "user_not_found", "This user does not exist.");
    }
    const input = parseWithSchema(
      adminUserUpdateSchema,
      await readJsonBody(request),
      "The account update is invalid.",
    );

    const disabling = input.status === "disabled";
    const demoting = input.role !== undefined && input.role !== "admin";
    if (id === admin.id && (disabling || demoting)) {
      throw new ApiError(
        400,
        "self_lockout",
        "You cannot disable or demote your own administrator account.",
      );
    }
    const removesActiveAdmin =
      target.role === "admin" &&
      target.status === "active" &&
      (disabling || demoting);
    if (removesActiveAdmin && (await countActiveAdmins()) <= 1) {
      throw new ApiError(
        409,
        "last_admin",
        "At least one active administrator must remain.",
      );
    }

    await updateUserRoleStatus(id, input);
    if (disabling || demoting) {
      await revokeAllRefreshTokensForUser(id);
    }
    const updated = await findUserById(id);
    await recordAudit({
      actorId: admin.id,
      actorRole: admin.role,
      action: "admin.user.update",
      targetType: "user",
      targetId: id,
      requestId: requestIdFor(request),
      metadata: { role: input.role, status: input.status },
    });

    return NextResponse.json(
      { user: updated ? toPublicUser(updated) : null },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function payments(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    await requireAdmin(request);
    const query = readListQuery(request);
    const result = await listAdminPayments(
      { limit: query.limit, offset: query.offset },
      {
        category: query.raw.get("category") ?? undefined,
        q: query.q,
      },
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  });
}

export async function consents(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    await requireAdmin(request);
    const query = readListQuery(request);
    const result = await listAllConsents({
      limit: query.limit,
      offset: query.offset,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  });
}

export async function reports(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    await requireAdmin(request);
    const query = readListQuery(request);
    const result = await listAllReports({
      limit: query.limit,
      offset: query.offset,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  });
}

export async function auditLogs(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    await requireAdmin(request);
    const query = readListQuery(request);
    const result = await listAuditLogs(
      { limit: query.limit, offset: query.offset },
      {
        action: query.raw.get("action") ?? undefined,
        actorId: query.raw.get("actor_id") ?? undefined,
      },
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  });
}

export async function organizations(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    await requireAdmin(request);
    return NextResponse.json(
      { organizations: await listOrganizations() },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
