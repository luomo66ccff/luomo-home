export class RequestBodyError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readJsonObject(request: Request, limit = 16384): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > limit) throw new RequestBodyError(413, "request_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError(400, "invalid_json");
  let bytes = 0; let text = ""; const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > limit) { await reader.cancel(); throw new RequestBodyError(413, "request_too_large"); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new RequestBodyError(400, "invalid_json"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RequestBodyError(400, "invalid_body");
  return value as Record<string, unknown>;
}
