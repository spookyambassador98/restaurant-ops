import { NextRequest } from "next/server";
import { opsEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const publicId = request.nextUrl.searchParams.get("publicId")?.toUpperCase();
  if (!publicId) {
    return new Response("publicId required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const channel = `order:${publicId}`;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          cleanup();
        }
      };

      const handler = (event: unknown) => send(event);
      opsEvents.on(channel, handler);

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          cleanup();
        }
      }, 15000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        opsEvents.off(channel, handler);
      };

      send({ type: "connected", publicId });
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
