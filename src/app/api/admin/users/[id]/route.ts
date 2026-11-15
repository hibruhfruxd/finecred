import { updateUser } from "@/backend/http/controllers/admin-console";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return updateUser(request, context);
}
