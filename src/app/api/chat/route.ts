import { handleChatMessage } from "@/lib/chat";

export async function POST(request: Request) {
  const { message } = await request.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: "thinking" })}\n\n`));
      const result = await handleChatMessage(message);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: "complete", result })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
