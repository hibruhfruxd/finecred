import type { ApiErrorBody } from "@/models/api";

export class ClientApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function parseError(response: Response): Promise<ClientApiError> {
  let code = "request_failed";
  let message = "The request could not be completed. Please try again.";
  let fields: Record<string, string> = {};

  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      fields = body.error.fields ?? {};
    }
  } catch {
    // Fall back to a generic message when the response is not JSON.
  }

  return new ClientApiError(response.status, code, message, fields);
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ClientApiError(
      0,
      "network_error",
      "FinCred could not reach the demo server. Check your connection and try again.",
    );
  }

  if (response.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("fincred:unauthorized"));
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as T;
}

export async function downloadAttachment(url: string, fallbackName: string): Promise<void> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fallbackName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
