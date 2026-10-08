import type { Agreement } from "./agreement";
export type Account = { id: string; name: string; email: string };
export type ProjectSummary = {
  id: string;
  currentVersion: number;
  title: string | null;
  draftTitle: string | null;
  role: "client" | "freelancer";
  clientName: string;
  freelancerName: string;
};
export type Version = {
  version: number;
  agreement: Agreement;
  publishedBy: string;
  publishedAt: string;
  acceptances: { userId: string; role: string; acceptedAt: string }[];
};
export type Project = {
  id: string;
  currentVersion: number;
  fundingStarted: boolean;
  role: "client" | "freelancer";
  client: Pick<Account, "id" | "name">;
  freelancer: Pick<Account, "id" | "name">;
  versions: Version[];
  draft: {
    agreement: Agreement;
    baseVersion: number;
    revision: number;
    updatedAt: string;
  } | null;
};
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "x-accordbridge-request": "1",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(
      data.errors
        ?.map(
          (item: { field: string; message: string }) =>
            `${item.field}: ${item.message}`,
        )
        .join(" · ") ||
        data.message ||
        "The request failed.",
      response.status,
    );
  return data as T;
}
