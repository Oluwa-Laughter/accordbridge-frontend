import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!["auth", "projects", "health", "testnet"].includes(path[0]))
    return Response.json({ message: "Not found." }, { status: 404 });
  const base = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
  const headers = new Headers();
  for (const name of [
    "content-type",
    "cookie",
    "origin",
    "x-accordbridge-request",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const upstream = await fetch(
      `${base}/api/${path.map(encodeURIComponent).join("/")}`,
      {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : await request.text(),
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      },
    );
    const responseHeaders = new Headers({
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    });
    for (const cookie of upstream.headers.getSetCookie())
      responseHeaders.append("set-cookie", cookie);
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        message:
          "The workspace service is unavailable. Your unsaved edits are still on this page.",
      },
      { status: 503 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PUT };
