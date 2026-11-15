import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { zodFieldErrors } from "@/models/validation/zod-errors";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function errorResponse(error: ApiError): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    },
    {
      status: error.status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function withApiHandler(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error);
    }
    console.error("[fincred-api] Unhandled route error:", error);
    return errorResponse(
      new ApiError(
        500,
        "internal_error",
        "Something went wrong while processing this request. Please try again.",
      ),
    );
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, "invalid_json", "The request body must be valid JSON.");
  }
}

export async function readFormData(request: Request): Promise<FormData> {
  try {
    return await request.formData();
  } catch {
    throw new ApiError(
      400,
      "invalid_form_data",
      "The payment form could not be read. Please refresh and try again.",
    );
  }
}

export function parseWithSchema<Output>(
  schema: ZodType<Output>,
  data: unknown,
  message = "Please correct the highlighted fields.",
): Output {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(422, "validation_error", message, zodFieldErrors(result.error));
  }
  return result.data;
}
